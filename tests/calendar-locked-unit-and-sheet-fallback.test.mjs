import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

/**
 * 21/11/2026: the PS5 calendar showed every day "ว่าง", then "ไม่ว่าง" a moment
 * later. The sheet's Apps Script answered first (the Bot was slow) and its
 * LOCKED units, a bare status with no bookings, read as free.
 */
const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function rowAvailable() {
  const from = page.indexOf('  function requestKey(code){');
  const to = page.indexOf('  function consoleTodayAvailability(c){');
  const ctx = {};
  vm.runInNewContext(page.slice(from, to) + '\nfunction ownQueueCode(){ return ""; }\nthis.check = rowAvailableForRange;', ctx);
  return ctx.check;
}

test('a LOCKED, END or closed unit is never free to a customer; an idle one is', () => {
  const check = rowAvailable();
  const start = new Date(2026, 10, 22), end = new Date(2026, 10, 25);
  for (const status of ['LOCKED', 'Locked', 'ล็อค', 'END']) {
    assert.equal(check({ status, bookingRanges: [] }, start, end), false, status);
  }
  assert.equal(check({ status: 'Available', bookingRanges: [] }, start, end), true);
});

test("the sheet's answer stands in only until the Bot answers, and is not cached", () => {
  assert.match(page, /return payload && typeof payload === "object" \? \{\.\.\.payload, _ajSource:"sheet"\} : payload;/);
  assert.match(page, /const fromSheet = \["sheet","apps-script"\]\.includes\(availabilityPayload\?\._ajSource\);/);
  assert.match(page, /if\(fromSheet\) scheduleBotAvailabilityRecheck\(\);\n      else\{/);
  assert.match(page, /if\(sheetRecheckTimer \|\| sheetRecheckTries >= 4\) return;/);
});
