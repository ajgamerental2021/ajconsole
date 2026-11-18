import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 19/11/2026, the owner's rule: the slot is locked for 10 minutes and the
// payment page counts the lock down, in Thai and English.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between = (start, end) => { const i = html.indexOf(start); return html.slice(i, html.indexOf(end, i)); };
const src = between('const demoHoldState = {problem:"", timer:0};', '  function demoHoldCountdownHtml(){');

function make(lang, holds, problem = '') {
  const state = { lang, calc: { rentalCode: 'AJ-20261118-R0204' }, availability: { holds } };
  const esc = (v) => String(v);
  const fn = new Function('state', 'savedOwnBookingHold', 'esc', `${src}; demoHoldState.problem = ${JSON.stringify(problem)}; return demoHoldCountdownState;`);
  return fn(state, () => null, esc);
}
const at = (seconds) => new Date(Date.now() + seconds * 1000).toISOString();
const mine = (seconds, code = 'AJ-20261118-R0204') => ({ rentalCode: code, mine: true, expiresAt: at(seconds) });

test('a held slot counts down mm:ss, TH and EN', () => {
  const th = make('th', [mine(9 * 60 + 41)])();
  assert.match(th.html, /ล็อคคิวนี้ไว้ให้คุณแล้ว กรุณาชำระเงินภายใน <b>9:4[01]<\/b> นาที/);
  assert.equal(th.tone, '');
  const en = make('en', [mine(65)])();
  assert.match(en.html, /This slot is held for you\. Please complete payment within <b>1:0[45]<\/b> minutes\./);
});

test('another rental\'s hold or someone else\'s is not this page\'s clock', () => {
  assert.equal(make('th', [mine(300, 'AJ-20261118-R0218')])().tone, 'is-idle');
  assert.equal(make('th', [{ rentalCode: 'AJ-20261118-R0204', mine: false, expiresAt: at(300) }])().tone, 'is-idle');
});

test('when the 10 minutes end: Pay checks and locks again, TH and EN', () => {
  const th = make('th', [mine(-5)])();
  assert.equal(th.tone, 'is-ended');
  assert.match(th.html, /หมดเวลาล็อคคิว 10 นาทีแล้ว กด “ชำระเงิน” เพื่อเช็คคิวและล็อคให้ใหม่อีก 10 นาที \(ถ้ายังว่าง\)/);
  assert.match(make('en', [mine(-5)])().html, /Your 10-minute hold has ended\. Tap Pay to check the slot again/);
});

test('not locked yet: says Pay locks it for 10 minutes; a lock that failed says why', () => {
  assert.match(make('th', [])().html, /เมื่อกด “ชำระเงิน” ระบบจะล็อคคิวไว้ให้คุณ 10 นาที/);
  assert.match(make('en', [])().html, /When you tap Pay, the slot is held for you for 10 minutes/);
  const failed = make('th', [], 'มี 1 คิวกำลังทำรายการ')();
  assert.equal(failed.tone, 'is-ended');
  assert.equal(failed.html, 'มี 1 คิวกำลังทำรายการ');
});

test('the order page locks the slot as it opens, and the box sits above Pay', () => {
  assert.match(html, /maybeSendPayLaterEmail\(\);\n\s+void lockOrderSlot\(code\);/);
  assert.match(html, /\$\{demoHoldCountdownHtml\(\)\}\$\{deliveryFallbackHtml\(\)\}<button class="btn primary demo-pay-btn" id="demoBeamPay"/);
});
