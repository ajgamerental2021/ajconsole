import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('no verification chosen: a green button offers verification for the normal deposit', () => {
  assert.match(html, /id="demoVerifyForDeposit" type="button">\$\{en \? `Verify your identity to lower the deposit to \$\{money\(deposits\.normal\)\}` : `ยืนยันตัวตนเพื่อลดค่าประกันเป็น \$\{money\(deposits\.normal\)\}`\}/);
  // It opens the customer details dialog with the identity fields at its top;
  // Cancel puts the no-verification choice back (the dialog's snapshot).
  assert.match(html, /function openDemoVerifyForDeposit\(\)\{\n    openDemoEditModal\(2\);\n    setDemoNoContract\(false\);/);
  assert.match(html, /querySelector\("\.demo-id-type"\)\?\.closest\("\.field"\);\n    if\(field\)\{\n      field\.scrollIntoView\(\{block:"start"\}\);/);
  assert.match(html, /\.demo-verify-btn\{background:#15803d;border-color:#15803d;color:#fff\}/);
});

test('verification left for later: a red-outlined button skips it for the higher deposit; "Verify now" is green', () => {
  assert.match(html, /id="demoSkipIdentity" type="button">\$\{en \? `No verification · deposit becomes \$\{money\(deposits\.noId\)\}` : `ไม่ต้องการยืนยันตัวตน · ค่าประกันปรับเป็น \$\{money\(deposits\.noId\)\}`\}<\/button><button class="btn demo-verify-btn" id="demoVerifyLater"/);
  assert.match(html, /\.demo-skip-id-btn\{background:#fff;border:1\.5px solid #c90012;color:#c90012\}/);
  assert.match(html, /return \{normal:Number\(deposit\) \|\| 0, noId:bundleName \? 15000 : noContractDeposit\(deposit\)\};/);
  // One switch for the step 2 checkbox and these buttons; it drops a payment
  // link made for the old deposit.
  assert.match(html, /function setDemoNoContract\(value\)\{\n    state\.calc\.noContract = !!value;\n    state\.calc\.beamPaymentLink = "";/);
  assert.match(html, /event\.target\.id === "demoIdentityNoContractOpt"\)\{\n        setDemoNoContract\(event\.target\.checked\);/);
});

test('the customer details dialog does not save with required fields empty, and says what is missing', () => {
  assert.match(html, /if\(save && demoEditStep === 2 && !showDemoStep2Problems\(\)\)\{/);
  assert.match(html, /<p class="demo-edit-missing" id="demoEditMissing" role="status" hidden><\/p>/);
  assert.match(html, /`⚠️ ยังกรอกไม่ครบ: \$\{problems\[0\]\.message\}/);
  assert.match(html, /`⚠️ Not complete yet: \$\{problems\[0\]\.message\}/);
  assert.match(html, /save\.classList\.toggle\("is-incomplete", problems\.length > 0\);/);
  assert.match(html, /function renderStepActions\(\)\{\n    \/\/ The customer details dialog follows every edit too\.\n    if\(demoEditStep\) updateDemoEditMissing\(\);/);
});
