import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function extract(name){
  const found = html.search(new RegExp(`\\n  (async )?function ${name}\\(`));
  const start = found + 1;
  assert.ok(found > 0, name);
  const end = html.indexOf('\n  }\n', start);
  return html.slice(start, end + 4);
}

function problemFor(error, lang = 'th', type = 'thai_id'){
  const context = { state:{ lang }, demoIdentityType:() => type };
  vm.runInNewContext(`${extract('demoAgreementProblem')}; this.run = demoAgreementProblem;`, context);
  return context.run(error);
}
const refused = (fields, message = 'agreement_incomplete') => Object.assign(new Error(message), { fields });

test('each refused field sends the renter to the step that holds it, in Thai and English', () => {
  assert.deepEqual({ ...problemFor(refused(['idNumber'])) }, { step:3, field:'demoIdentityNumber', forgetDraft:true, message:'กรุณากรอกเลขบัตรประชาชนอีกครั้ง เลขที่บันทึกไว้หมดเวลาในระบบแล้ว' });
  assert.match(problemFor(refused(['idNumber']), 'en', 'passport').message, /^Please enter your passport number again/);
  assert.equal(problemFor(refused(['phone'])).field, 'demoCustomerPhone');
  assert.equal(problemFor(refused(['address', 'pickupLocation', 'returnLocation'])).field, 'demoMaps');
  assert.equal(problemFor(refused(['deviceId'])).step, 1);
  assert.equal(problemFor(refused(['refundAccountNumber'])).step, 3);
  assert.equal(problemFor(refused(['wiseEmail']), 'en').message, 'Please check the refund account details.');
  assert.equal(problemFor(refused(['signatureDataUrl'])).message, 'กรุณาเซ็นลายเซ็นในกรอบอีกครั้ง');
  assert.equal(problemFor(refused(['idExpiry'], 'id_expires_before_return')).field, 'demoIdentityExpiry');
  assert.equal(problemFor(new Error('booking_context_not_found'), 'en').message, 'The booking session timed out. Please press confirm again.');
  // Anything else no longer blames the refund account and signature.
  assert.doesNotMatch(problemFor(new Error('HTTP 502')).message, /บัญชีรับเงินคืนและลายเซ็น/);
  assert.doesNotMatch(html, /ตรวจบัญชีรับเงินคืนและลายเซ็น แล้วลองใหม่/);
});

test('the ID number held by the Bot is checked before the agreement is sent', () => {
  const order = extract('openDemoOrder');
  assert.ok(order.indexOf('ensureIdentityDraftAlive()') < order.indexOf('ensureRentalCode(summary)'));
  assert.match(order, /showDemoAgreementProblem\(agreementSaved\.reason\)/);
  const alive = extract('ensureIdentityDraftAlive');
  assert.match(alive, /await saveIdentityDraft\(\)/);
  assert.match(alive, /\/api\/identity-drafts\/\$\{encodeURIComponent\(demoProfile\.identityDraftId\)\}/);
  // Only a draft the Bot says it no longer has is forgotten.
  assert.match(alive, /if\(response\.status !== 404\) return true;/);
  assert.match(alive, /forgetIdentityDraft\(\);\n    return false;/);
  // Signing again for a changed rental at payment gets the same guidance.
  assert.match(html, /await submitDemoAgreement\(handoff\.contextToken\);\n        \}catch\(error\)\{\n          hideDemoBusy\(\);\n          showDemoAgreementProblem\(error\);/);
});

test('a +66 number is sent as 0…, a number from abroad as typed', () => {
  const context = {};
  vm.runInNewContext(`${extract('thaiPhoneText')}; this.run = thaiPhoneText;`, context);
  assert.equal(context.run('+66635399435'), '0635399435');
  assert.equal(context.run('+66 81 234 5678'), '0812345678');
  assert.equal(context.run('66812345678'), '0812345678');
  assert.equal(context.run('081-234-5678'), '081-234-5678');
  assert.equal(context.run('+33 7 88 33 58 14'), '+33 7 88 33 58 14');
});

test('legal name accepts only the alphabet selected by the page language', () => {
  const context = {state:{lang:'th'}};
  vm.runInNewContext(`${extract('demoLegalNameValid')}; this.run = demoLegalNameValid;`, context);
  assert.equal(context.run('ปริวัฒน์ ภิรมย์บูรณ์', 'th'), true);
  assert.equal(context.run('Thanawat Boon', 'en'), true);
  assert.equal(context.run('Thanawat Boon', 'th'), false);
  assert.equal(context.run('ธวัชชัย Boon', 'th'), false);
  assert.equal(context.run('ธวัชชัย', 'en'), false);
  assert.equal(context.run('Thanawat2 Boon', 'en'), false);
  assert.match(extract('demoStep2Problems'), /demoLegalNameValid\(demoProfile\.fullName\)/);
  assert.match(extract('demoStep2Problems'), /tr\("legalNameScriptError"\)/);
  assert.match(html, /legalNameScriptError:"Enter your legal name using English letters only\."/);
  assert.match(html, /legalNameScriptError:"กรุณากรอกชื่อ-นามสกุลด้วยตัวอักษรไทยเท่านั้น"/);
  assert.match(html, /pattern="\$\{en \? "\[A-Za-z \]\+" : "\[ก-ฺเ-๎ \]\+"\}"/);
  const accountContext = {};
  vm.runInNewContext(`${extract('demoAccountNameValid')}; this.run = demoAccountNameValid;`, accountContext);
  assert.equal(accountContext.run("Anne-Marie O'Neil"), true);
  assert.match(extract('demoStep3Problems'), /demoAccountNameValid\(accountName\)/);
  assert.match(extract('demoRefundReady'), /demoAccountNameValid\(demoProfile\.refundAccountName\)/);
});

test('Console Pending gets the live delivery fee once it is quoted', () => {
  const order = extract('openDemoOrder');
  assert.match(order, /consolePendingRental = \{code, handoff, channel:"unified-flow-demo"\};\n      void queueConsolePendingUpsert\(\);/);
  // The quote starts with the agreement, not after the order page opens.
  assert.ok(order.indexOf('void fetchDemoDeliveryQuote()') < order.indexOf('Promise.allSettled'));
  assert.match(extract('fetchDemoDeliveryQuote'), /void recordDemoDeliveryQuote\(result\.quote\);\s+void queueConsolePendingUpsert\(\);/);
  const queue = extract('queueConsolePendingUpsert');
  assert.match(queue, /const fresh = bookingStructured\(rental\.code\) \|\| \{\};/);
  assert.match(queue, /consolePendingWrites = consolePendingWrites\n      \.then\(write\)/);
});

test('"Verify now" asks for everything step 3 does: photos, refund account (Wise in English), consent and signature', () => {
  const body = extract('verifyNowBodyHtml');
  assert.match(body, /demoIdentityUploadGridHtml\("verifyNow"\)/);
  assert.match(body, /id="verifyNowAgreementHost"/);
  // The step-3 card itself is lent to the pop-up and handed back when it closes.
  assert.match(extract('openVerifyNowModal'), /lendAgreementCard\(\);/);
  assert.match(extract('lendAgreementCard'), /host\.appendChild\(card\);/);
  assert.match(extract('closeModal'), /returnAgreementCard\(\);/);
  assert.match(extract('showModal'), /returnAgreementCard\(\);/);
  // Nothing missing is sent: the same checks as step 3, plus both photos.
  assert.match(extract('verifyNowProblems'), /demoStep3Problems\(\)\.filter\(problem => problem\.id !== "demoIdDocument"\)/);
  const submit = extract('submitVerifyNow');
  assert.ok(submit.indexOf('await submitDemoAgreement(token)') < submit.indexOf('await uploadDemoIdentity(token)'));
  // The refund block offers Wise on English bookings, with its full details.
  const refund = extract('demoRefundSectionHtml');
  assert.match(refund, /I do not have a Thai bank account and would like to receive the security deposit refund through Wise/);
  for (const key of ['wiseFullName', 'wiseCountry', 'wiseCurrency', 'wiseBankName', 'wiseAccountNumber', 'wiseSwift', 'wiseEmail']) assert.match(refund, new RegExp(`wiseField\\("${key}"`));
});

test('a VIP rate is the list price plus its own discount row, and the booking carries the VIP deposit and delivery quote', () => {
  assert.match(html, /costs\.push\(\{label: en \? `\$\{cName\(c\)\} rental` : `ค่าเช่า \$\{cName\(c\)\}`, value: money\(s\.regularRental\)\}\);/);
  assert.match(html, /if\(s\.vipRentalDisc\) costs\.push\(\{label: en \? "VIP rental rate discount" : "ส่วนลดราคาเช่า VIP"/);
  assert.match(html, /"ยอดค่าเช่า": Math\.max\(0, Number\(summary\.regularRental\|\|0\)/);
  assert.match(html, /vip: s\.vip \? \{id:s\.vip\.id, name:s\.vip\.name, rentalDiscount:s\.vipRentalDisc, depositDiscount:s\.vipDepositApplied, deposit:s\.vipDeposit\} : null,/);
  assert.match(html, /deliveryQuote: demoDelivery\.status === "ready" && demoDelivery\.quote \? \{subtotal:/);
  assert.match(html, /vipDeposit:terms\.vipDepositApplied \? deposit : 0,/);
});
