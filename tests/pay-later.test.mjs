import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the order page no longer explains the Delivery App, in either language', () => {
  assert.doesNotMatch(html, /หลังยืนยันยอดชำระ Delivery App จะย้ายรายการจาก Console Pending/);
  assert.doesNotMatch(html, /After payment is confirmed, Delivery App creates the Booking from Console Pending/);
});

test('pay later: saved like a payment, then the Bot emails the payment link', () => {
  assert.match(html, /id="demoPayLater"/);
  assert.match(html, /ชำระภายหลัง — ส่งลิงก์ชำระเงินทางอีเมล/);
  assert.match(html, /Pay later — email me a payment link/);
  const fn = html.slice(html.indexOf('async function requestDemoPayLater()'), html.indexOf('const payResume = {'));
  assert.match(fn, /await submitDemoAgreement\(handoff\.contextToken\)/);
  assert.match(fn, /await queueConsolePendingUpsert\(\);/);
  assert.match(fn, /\/api\/rentals\/pay-later/);
  assert.match(fn, /contextToken:handoff\.contextToken/);
  assert.doesNotMatch(fn, /ensureBookingHold|ensureBeamPaymentLink/, 'no queue held, nothing charged');
  assert.match(html, /if\(targetId === "demoPayLater"\)\{ await requestDemoPayLater\(\); return; \}/);
});

test('the payment page opens from the email link and pays through the server', () => {
  assert.match(html, /payParams\.has\("pay"\)/);
  assert.match(html, /if\(payLink\) openPayResume\(payLink\.code, payLink\.token\);/);
  assert.match(html, /\/api\/rentals\/payment-page`/);
  const launch = html.slice(html.indexOf('async function launchPayResume()'), html.indexOf('async function notifyDemoLine()'));
  assert.match(launch, /await ensureBookingHold\(r\.rentalCode, ctx\)/);
  assert.match(launch, /\/api\/rentals\/payment-page\/link/);
  assert.match(launch, /body:JSON\.stringify\(\{token:payResume\.token, method:payResume\.method\}\)/);
  assert.doesNotMatch(launch, /amount:/, 'the page never names the amount');
  assert.match(html, /body\.pay-resume-open main > section:not\(#payResumeSection\)\{display:none!important\}/);
  // No My rental before it is paid.
  const page = html.slice(html.indexOf('function payResumeHtml()'), html.indexOf('function renderPayResume()'));
  assert.doesNotMatch(page, /myRental|คิวเช่าของฉัน|My rental/);
});

test('the queue check takes the rental it is asked about', () => {
  assert.match(html, /function evaluateAvailability\(ctx = calcRentalContext\(\)\)/);
  assert.match(html, /async function ensureBookingHold\(rentalCode, ctx = calcRentalContext\(\)\)/);
  assert.match(html, /consoleId: String\(c\.id \|\| ""\),/);
});
