import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('  async function fetchJsonWithTimeout(');
const end = html.indexOf('  function refreshAvailabilitySupport()', start);
assert.ok(start > 0 && end > start);
const availabilityCode = html.slice(start, end);

function queueCheck(fetch) {
  const scaledTimeout = (callback, delay) => setTimeout(callback, delay / 100);
  return new Function('fetch', 'setTimeout', 'clearTimeout', 'AbortController', 'CONFIG', 'normalizeAvailabilityRows',
    `${availabilityCode}; return fetchAvailabilityPayload;`)(
      fetch, scaledTimeout, clearTimeout, AbortController,
      { availabilityApi: 'https://bot.test/api/availability', availabilityUrl: 'https://script.test/exec' },
      payload => Array.isArray(payload?.rows) ? payload.rows : [],
    );
}

const validResponse = () => ({ ok: true, json: async () => ({ rows: [{ deviceName: 'PS5' }] }) });
const stalled = () => new Promise(() => {});

test('a fast queue result does not start a redundant retry', async () => {
  const calls = [];
  const check = queueCheck(url => {
    calls.push(url);
    return url.includes('bot.test') ? Promise.resolve(validResponse()) : stalled();
  });
  const result = await check(123);
  assert.equal(result.rows[0].deviceName, 'PS5');
  await new Promise(resolve => setTimeout(resolve, 35));
  assert.equal(calls.length, 2);
});

test('a queue request still pending after six seconds hedges only the direct source', async () => {
  const calls = [];
  let retries = 0;
  const check = queueCheck(url => {
    calls.push(url);
    return url.includes('retry') && url.includes('script.test') ? Promise.resolve(validResponse()) : stalled();
  });
  const result = await check(123, () => { retries += 1; });
  assert.equal(result.rows[0].deviceName, 'PS5');
  assert.equal(retries, 1);
  assert.equal(calls.length, 3);
});

test('a failed or stalled queue check finishes within eighteen seconds without claiming availability', async () => {
  const calls = [];
  const check = queueCheck(url => { calls.push(url); return stalled(); });
  const started = performance.now();
  await assert.rejects(check(123));
  assert.equal(calls.length, 3);
  assert.ok(performance.now() - started < 250);
});

test('an empty queue response is rejected so another source can answer', async () => {
  const check = queueCheck(url => Promise.resolve(
    url.includes('bot.test') ? { ok: true, json: async () => ({ rows: [] }) } : validResponse(),
  ));
  const result = await check(123);
  assert.equal(result.rows[0].deviceName, 'PS5');
});

test('the calendar explains the automatic second check in Thai and English', () => {
  assert.match(html, /checkingAgain:"กำลังเช็คคิวอีกครั้ง\.\.\."/);
  assert.match(html, /checkingAgain:"Checking the queue again\.\.\."/);
  assert.match(html, /calendarStatus\.textContent = state\.availability\.loading\s*\? tr\(state\.availability\.retrying \? "checkingAgain" : "checking"\)/);
});

// 10/11/2026: one failed round no longer ends in "could not check the queue".
test('the queue check tries a second round before showing the error', () => {
  const fetchStart = html.indexOf('  function fetchAvailability(requireFresh = false){');
  const body = html.slice(fetchStart, html.indexOf('  function renderAvailabilityHint()', fetchStart));
  const first = body.indexOf('availabilityPayload = await fetchAvailabilityPayload(Date.now(), showRetrying, requireFresh);');
  const second = body.indexOf('availabilityPayload = await fetchAvailabilityPayload(Date.now(), showRetrying, requireFresh);', first + 10);
  assert.ok(first > 0 && second > first, 'two rounds');
  assert.ok(body.indexOf('}catch(firstError){') > first && body.indexOf('}catch(firstError){') < second);
  assert.ok(body.indexOf('showRetrying();', first) < second, '"checking again" is shown during the second round');
  assert.ok(body.indexOf('"availability_api_failed"') > second, 'reported only when both rounds fail');
});
