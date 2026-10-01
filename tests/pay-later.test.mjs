import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the order page no longer explains the Delivery App, in either language', () => {
  assert.doesNotMatch(html, /หลังยืนยันยอดชำระ Delivery App จะย้ายรายการจาก Console Pending/);
  assert.doesNotMatch(html, /After payment is confirmed, Delivery App creates the Booking from Console Pending/);
});

test('no extra button: the pay-later email goes out after step 3 is confirmed', () => {
  assert.doesNotMatch(html, /id="demoPayLater"/);
  assert.doesNotMatch(html, /ชำระภายหลัง — ส่งลิงก์ชำระเงินทางอีเมล/);
  assert.doesNotMatch(html, /Pay later — email me a payment link/);
  const fn = html.slice(html.indexOf('function maybeSendPayLaterEmail()'), html.indexOf('const payResume = {'));
  assert.match(fn, /demoDelivery\.status !== "ready"/, 'waits for the live delivery price');
  assert.match(fn, /Promise\.resolve\(consolePendingWrites\)/, 'after the row with the final figures');
  assert.match(fn, /\/api\/rentals\/pay-later/);
  assert.doesNotMatch(fn, /ensureBookingHold|ensureBeamPaymentLink/);
  assert.match(html, /scrollToDemoOrderTop\(\);\n\s*maybeSendPayLaterEmail\(\);/);
  assert.match(html, /void queueConsolePendingUpsert\(\);\n\s*maybeSendPayLaterEmail\(\);/);
});

test('under the pay button: you can pay later, the email has been sent (TH/EN)', () => {
  assert.match(html, /\$\{demoPayLaterNoteHtml\(\)\}/);
  assert.match(html, /สามารถชำระเงินภายหลังได้ ทางร้านส่งอีเมลพร้อมรายละเอียดและลิงก์ชำระเงินให้แล้ว/);
  assert.match(html, /You can also pay later\. AJ has emailed the details and a payment link/);
});

test('opening the payment link checks the queue at once and says so in a pop-up', () => {
  assert.match(html, /if\(payResume\.rental && !payResume\.rental\.paid\) void checkPayResumeQueue\(\);/);
  const check = html.slice(html.indexOf('async function checkPayResumeQueue()'), html.indexOf('function payResumeContext('));
  assert.match(check, /evaluateAvailability\(ctx\)/);
  assert.match(check, /showPayResumeQueuePopup\(gate\.message\)/);
  assert.match(html, /คิวช่วงนี้ไม่ว่างแล้ว/);
  assert.match(html, /These dates are no longer available/);
  assert.match(html, /showPayResumeQueuePopup\(error\.message\)/);
  assert.match(html, /id="payResumePay" type="button" \$\{payResume\.queueBlocked \? "disabled" : ""\}/);
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
