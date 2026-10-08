import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('no verification chosen: a green button offers verification for the normal deposit', () => {
  assert.match(html, /id="demoVerifyForDeposit" type="button">\$\{en \? `Verify your identity to lower the deposit to \$\{money\(deposits\.normal\)\}` : `ยืนยันตัวตนเพื่อลดค่าประกันเป็น \$\{money\(deposits\.normal\)\}`\}/);
  // The same popup holds step 2 customer details and step 3 refund/signature,
  // with identity photos; cancelling restores the earlier choice.
  assert.match(html, /function openDemoVerifyForDeposit\(\)\{\n    verifyForDepositSnapshot =/);
  assert.match(html, /verifyForDepositActive = true;\n    state\.calc\.noContract = false;/);
  assert.match(html, /render\(\);\n    openVerifyNowModal\(\);/);
  assert.match(html, /verifyForDepositActive \? `<div class="card verify-now-customer"/);
  assert.match(html, /lendCustomerCard\(\);\n    lendAgreementCard\(\);/);
  assert.match(html, /if\(verifyForDepositActive && verifyForDepositSnapshot\)\{/);
  assert.match(html, /\.demo-verify-btn\{background:#15803d;border-color:#15803d;color:#fff\}/);
});

test('verification left for later: a red-outlined button skips it for the higher deposit; "Verify now" is green', () => {
  assert.match(html, /id="demoSkipIdentity" type="button">\$\{en \? `No verification · deposit becomes \$\{money\(deposits\.noId\)\}` : `ไม่ต้องการยืนยันตัวตน · ค่าประกันปรับเป็น \$\{money\(deposits\.noId\)\}`\}<\/button><button class="btn demo-verify-btn" id="demoVerifyLater"/);
  assert.match(html, /\.demo-skip-id-btn\{background:#fff;border:1\.5px solid #c90012;color:#c90012\}/);
  assert.match(html, /noId:bundleName \? Math.max\(Number\(deposit\) \|\| 0, pricingPolicy\?\.bundleNoIdentityDeposit \|\| 15000\)/);
  // One switch for the step 2 checkbox and these buttons; it drops a payment
  // link made for the old deposit.
  assert.match(html, /function setDemoNoContract\(value\)\{\n    state\.calc\.noContract = !!value;[\s\S]*?state\.calc\.beamPaymentLink = "";/);
  assert.match(html, /if\(event\.target\.id === "demoNoContractOpt"\)\{\n        setDemoNoContract\(event\.target\.checked\);/);
  assert.doesNotMatch(html, /id="demoIdentityNoContractOpt"/);
});

test('the customer details dialog does not save with required fields empty, and says what is missing', () => {
  assert.match(html, /if\(save && demoEditStep === 2 && !showDemoStep2Problems\(\)\)\{/);
  assert.match(html, /<p class="demo-edit-missing" id="demoEditMissing" role="status" hidden><\/p>/);
  assert.match(html, /`⚠️ ยังกรอกไม่ครบ: \$\{problems\[0\]\.message\}/);
  assert.match(html, /`⚠️ Not complete yet: \$\{problems\[0\]\.message\}/);
  assert.match(html, /save\.classList\.toggle\("is-incomplete", problems\.length > 0\);/);
  assert.match(html, /function renderStepActions\(\)\{\n    \/\/ The customer details dialog follows every edit too\.\n    if\(demoEditStep\) updateDemoEditMissing\(\);/);
});
