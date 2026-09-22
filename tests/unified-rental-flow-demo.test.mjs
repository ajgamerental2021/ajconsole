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
  assert.match(html, /identityType: UNIFIED_FLOW_DEMO \? demoIdentityType\(\) : ""/);
});

test('postal code fills subdistrict, district and province from the service-area file', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../assets/data/service-area-addresses.json', import.meta.url), 'utf8'));
  assert.deepEqual(data.provinces.map((row) => row[0]), ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม']);
  const chatuchak = data.subdistricts.filter((row) => row[0] === '10900').map((row) => row[1]);
  assert.ok(chatuchak.includes('เสนานิคม'));
  assert.match(html, /fetch\("assets\/data\/service-area-addresses\.json"/);
  assert.match(html, /list="demoSubdistrictList"/);
  assert.match(html, /if\(event\.target\.id === "demoPostalCode"\) void onDemoPostalCode/);
});

test('Rental Terms acceptance unlocks only after the embedded terms are read', () => {
  assert.match(html, /\$\{demoProfile\.termsRead\?"":"disabled"\}/);
  assert.match(html, /event\.data\?\.type === "AJ_RENTAL_TERMS_READ"/);
  assert.match(html, /demoProfile\.termsAccepted = demoProfile\.termsRead && event\.target\.checked/);
});

test('identity images are uploaded to the booking context before the Rental ID page opens', () => {
  assert.match(html, /\/api\/booking-context\/\$\{encodeURIComponent\(contextToken\)\}\/identity/);
  const openOrder = html.slice(html.indexOf('async function openDemoOrder'), html.indexOf('async function launchDemoBeamPayment'));
  assert.ok(openOrder.indexOf('uploadDemoIdentity(') < openOrder.indexOf('state.calc.demoOrderOpen = true'));
  assert.match(html, /Images received — awaiting AJ review/);
  assert.doesNotMatch(html, /are not uploaded by the demo/);
});
