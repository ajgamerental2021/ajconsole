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
  assert.deepEqual({ ...problemFor(refused(['idNumber'])) }, { step:2, field:'demoIdentityNumber', forgetDraft:true, message:'กรุณากรอกเลขบัตรประชาชนอีกครั้ง เลขที่บันทึกไว้หมดเวลาในระบบแล้ว' });
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
