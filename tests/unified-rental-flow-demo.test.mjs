import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../rental-flow-demo.html', import.meta.url), 'utf8');

test('separate demo entry enables the feature-gated unified flow', () => {
  assert.match(entry, /flowDemo', '1'/);
  assert.match(entry, /booking', '1'/);
  assert.match(html, /const UNIFIED_FLOW_DEMO = PAGE_PARAMS\.get\("flowDemo"\) === "1"/);
  assert.match(html, /body\.classList\.add\("unified-flow-demo"\)/);
});

test('demo reuses live game and adds customer, identity and payment stages', () => {
  assert.match(html, /demoGameHost/);
  assert.match(html, /demoIdentityCard/);
  assert.match(html, /demoOrderPage/);
  assert.match(html, /demoCustomerName/);
  assert.match(html, /demoCustomerPhone/);
  assert.match(html, /demoIdentityNumber/);
  assert.match(html, /demoSelfieWithId/);
  assert.match(html, /demoTermsOpt/);
  assert.match(html, /beamPaymentApiDemo/);
});

test('demo customer details are included in the real booking context', () => {
  assert.match(html, /customerName: String\(UNIFIED_FLOW_DEMO \? demoProfile\.fullName/);
  assert.match(html, /phone: String\(UNIFIED_FLOW_DEMO \? demoProfile\.phone/);
  assert.match(html, /identityVerificationStatus/);
  assert.match(html, /deliveryAddress/);
  assert.match(html, /customerDataSource: UNIFIED_FLOW_DEMO/);
});

test('demo identity data stays in page memory and no-contract deposit uses the proposed tiers', () => {
  assert.match(html, /const demoProfile = \{/);
  assert.match(html, /if\(UNIFIED_FLOW_DEMO\) return Number\(base\) >= 4000 \? 15000 : 10000/);
  assert.match(html, /Identity numbers, addresses and images deliberately stay out of localStorage/);
});

test('payment success handoff can request confirmation-only LINE Flex', () => {
  const success = fs.readFileSync(new URL('../payment-success.html', import.meta.url), 'utf8');
  assert.match(success, /confirmationOnly/);
  assert.match(success, /flowDemo/);
  assert.match(html, /confirmationOnly:params\.get\("confirmationOnly"\) === "1"/);
});

test('demo does not reopen with an expired rental draft', () => {
  assert.match(html, /UNIFIED_FLOW_DEMO && state\.calc\.end && state\.calc\.end < todayIso\(\)/);
  assert.match(html, /state\.calc\.datesTouched = false/);
  assert.match(html, /state\.calc\.demoContractSignature = ""/);
});

test('demo summary hides the old chat booking buttons', () => {
  assert.match(html, /class="hint summary-final-help"/);
  assert.match(html, /body\.unified-flow-demo #summaryBox \.summary-actions/);
});

test('demo Rental ID page does not reopen without the in-memory customer profile', () => {
  assert.match(html, /if\(state\.calc\.demoOrderOpen && !demoProfile\.fullName\.trim\(\)\)\{\n\s*state\.calc\.demoOrderOpen = false;\n\s*state\.calc\.step = 2;/);
});

test('no-contract choice sits with the identity-number fields', () => {
  const identity = html.indexOf('for="demoIdentityNumber"');
  const noContract = html.indexOf('id="demoNoContractOpt"');
  const address = html.indexOf('for="demoAddressLine"');
  assert.ok(identity < noContract && noContract < address);
});

test('document type is chosen separately from the page language', () => {
  assert.match(html, /name="demoIdentityType" value="passport"/);
  assert.match(html, /return demoProfile\.identityType \|\| \(state\.lang === "en" \? "passport" : "thai_id"\)/);
  assert.match(html, /demoIdentityType\(\) === "passport" \? \/\^\[A-Z0-9\]\{6,20\}\$\/i\.test\(identity\) : thaiIdValid\(identity\)/);
  assert.match(html, /identityType: UNIFIED_FLOW_DEMO && !state\.calc\.noContract \? demoIdentityType\(\) : ""/);
});

test('postal code fills subdistrict, district and province from the service-area file', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../assets/data/service-area-addresses.json', import.meta.url), 'utf8'));
  assert.deepEqual(data.provinces.map((row) => row[0]), ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม']);
  const chatuchak = data.subdistricts.filter((row) => row[0] === '10900').map((row) => row[1]);
  assert.ok(chatuchak.includes('เสนานิคม'));
  assert.match(html, /fetch\("assets\/data\/service-area-addresses\.json"/);
  assert.match(html, /<select class="input" id="demoSubdistrict">/);
  assert.match(html, /if\(event\.target\.id === "demoPostalCode"\) void onDemoPostalCode/);
});

test('Rental Terms are embedded and acceptance is recorded', () => {
  assert.match(html, /class="demo-terms-frame"/);
  assert.match(html, /demoProfile\.termsAccepted = event\.target\.checked/);
  assert.doesNotMatch(html, /demoProfile\.termsRead/);
});

test('identity uploads offer a camera and an example photo', () => {
  assert.match(html, /data-open-camera="demoIdDocumentCamera"/);
  assert.match(html, /data-identity-example="selfie"/);
  assert.match(html, /capture="user"/);
  assert.match(html, /function showDemoIdentityExample\(kind\)/);
  assert.doesNotMatch(html, /For safety, the separate document image remains required/);
});

test('a visitor without Thai address details can rely on the map pin', () => {
  assert.match(html, /id="demoNoThaiAddress"/);
  assert.match(html, /I don't have Thai address details/);
  assert.match(html, /if\(!demoProfile\.noThaiAddress\)\{/);
});

test('identity images are uploaded to the booking context before the Rental ID page opens', () => {
  assert.match(html, /\/api\/booking-context\/\$\{encodeURIComponent\(contextToken\)\}\/identity/);
  const openOrder = html.slice(html.indexOf('async function openDemoOrder'), html.indexOf('async function launchDemoBeamPayment'));
  assert.ok(openOrder.indexOf('uploadDemoIdentity(') < openOrder.indexOf('state.calc.demoOrderOpen = true'));
  assert.match(html, /Images received — awaiting AJ review/);
  assert.doesNotMatch(html, /are not uploaded by the demo/);
});

test('step 2 marks the fields that still need filling instead of a dead button', () => {
  assert.match(html, /function demoStep2Problems\(\)/);
  assert.match(html, /function showDemoStep2Problems\(\)/);
  assert.match(html, /stepReady\(step\) \|\| \(UNIFIED_FLOW_DEMO && step === 2\)/);
  assert.match(html, /class="field-error"/);
  assert.match(html, /<span class="req">\*<\/span>/);
  assert.doesNotMatch(html, /No OTP is used\. For privacy/);
});

test('declining identity removes the document fields and step 3 upload', () => {
  assert.match(html, /ไม่ต้องการยืนยันตัวตน \/ ไม่ต้องการให้ข้อมูลส่วนตัว/);
  assert.match(html, /I prefer not to verify my identity or share personal documents/);
  assert.match(html, /\$\{state\.calc\.noContract \? "" : `/);
  assert.match(html, /if\(state\.calc\.noContract\)\{\n\s*card\.innerHTML/);
  assert.match(html, /if\(state\.calc\.noContract\) return "not_provided"/);
});

test('the guide never moves the demo customer between steps', () => {
  assert.match(html, /if\(!UNIFIED_FLOW_DEMO && options\.syncStep !== false && step && state\.calc\.step !== step\)/);
});

test('round-trip delivery price comes from the Bot and is never shown as final when missing', () => {
  assert.match(html, /\/api\/delivery\/quote/);
  assert.match(html, /demoDelivery = \{status:"idle", quote:null\}/);
  assert.match(html, /Awaiting confirmed quote/);
  assert.match(html, /Map link has no pin/);
  assert.match(html, /hasLargeItem: \/G29\|Logitech\|VR2\|Racing\/i\.test\(name\)/);
});

test('privacy policy explains that AJ stores no card or e-wallet details', () => {
  assert.match(html, /AJ does not store your credit card number or e-wallet credentials/);
  assert.match(html, /AJ ไม่ได้จัดเก็บหมายเลขบัตรเครดิตหรือข้อมูล E-Wallet/);
});

test('customer-facing contact email uses the AJ domain', () => {
  assert.match(html, /Email contact@ajgamerental\.com/);
  assert.match(html, /อีเมล contact@ajgamerental\.com/);
  assert.match(html, /Email: contact@ajgamerental\.com/);
  // The Wise payment account is a bank detail, not a contact address.
  assert.match(html, /wiseEmail: "ajgamerental2021@gmail\.com"/);
});

test('the Rental ID page shows the device photo and everything included', () => {
  assert.match(html, /function demoRentalItemHtml\(item, summary\)/);
  assert.match(html, /class="demo-item-thumb"/);
  assert.match(html, /summary\.bundleName \? \[`\$\{tr\("bundle"\)\}/);
  assert.match(html, /demo-item-details/);
});

test('the payment breakdown separates charges, discounts, delivery and totals', () => {
  assert.match(html, /function demoPaymentBreakdownHtml\(summary\)/);
  assert.match(html, /"is-discount"/);
  assert.match(html, /"is-grand"/);
  assert.match(html, /en \? "Vehicle" : "ประเภทรถ"/);
  assert.match(html, /summary\.retDisc \? \[row\(/);
  assert.match(html, /summary\.reviewGoogleDisc \? \[row\(/);
});

test('the demo and the booking page share one payment picker', () => {
  assert.match(html, /function paymentPickerHtml\(\{disabled = "", wiseStatus = null\} = \{\}\)/);
  assert.match(html, /function demoPaymentOptionsHtml\(\)\{\n\s*return paymentPickerHtml\(\);/);
  assert.doesNotMatch(html, /via Beam \(test charge/);
  assert.match(html, /payment-wise-logo/);
  assert.match(html, /ชำระค่าจอง \$\{money\(CONFIG\.reservationAmount\)\} และที่เหลือปลายทาง/);
});

test('a live Master Agreement replaces identity verification for the rental', () => {
  assert.match(html, /function demoIdentityCoveredByAgreement\(\)\{\n\s*return state\.calc\.retVerified && hasVerifiedAgreementRecord\(\);/);
  assert.match(html, /if\(demoIdentityCoveredByAgreement\(\)\)\{\n\s*card\.innerHTML/);
  assert.match(html, /verified_master_agreement/);
  assert.match(html, /state\.calc\.ret \? demoReviewDiscountsHtml\(\) : ""/);
});

test('a verified LINE sign-in fills the saved email and address', () => {
  assert.match(html, /demoProfile\.email = String\(result\.profile\.email/);
  assert.match(html, /applyDemoSavedAddress\(String\(result\.profile\.address \|\| ""\)\)/);
});
