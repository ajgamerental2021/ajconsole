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
  assert.match(html, /if\(state\.calc\.demoOrderOpen && \(!demoProfile\.fullName\.trim\(\) \|\| !state\.calc\.rentalCode\)\)\{\n\s*state\.calc\.demoOrderOpen = false;\n\s*state\.calc\.step = 2;/);
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
  assert.match(html, /demoDelivery = \{status:"idle", quote:null, key:""\}/);
  assert.match(html, /Awaiting confirmed quote/);
  assert.ok(html.includes('needs_pin: en ? "Map pin needed" : "ต้องปักหมุดแผนที่"'));
  assert.match(html, /hasLargeItem: \/G29\|Logitech\/i\.test\(name\)/);
});

test('privacy policy explains that AJ stores no card or e-wallet details', () => {
  assert.match(html, /AJ does not store your card number or e-wallet credentials/);
  assert.match(html, /AJ ไม่ได้จัดเก็บหมายเลขบัตรหรือข้อมูล E-Wallet/);
});

test('customer-facing contact email uses the AJ domain', () => {
  assert.match(html, /href="mailto:contact@ajgamerental\.com"/);
  assert.match(html, /href="tel:\+66816244715"/);
  assert.match(html, /lineAddFriendUrl: "https:\/\/lin\.ee\/w4TFyCV"/);
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
  assert.match(html, /return state\.calc\.retVerified && hasVerifiedAgreementRecord\(\) && !demoIdentityExpired\(\);/);
  assert.match(html, /if\(demoIdentityCoveredByAgreement\(\)\)\{\n\s*card\.innerHTML/);
  assert.match(html, /verified_master_agreement/);
  assert.match(html, /state\.calc\.ret \? demoReviewDiscountsHtml\(\) : ""/);
});

test('a verified LINE sign-in fills the saved email and address', () => {
  assert.match(html, /demoProfile\.email = String\(result\.profile\.email/);
  assert.match(html, /applyDemoSavedAddress\(String\(result\.profile\.address \|\| ""\)\)/);
});

test('multi-line catalogue details render as separate lines everywhere', () => {
  assert.match(html, /function splitDetailLines\(items\)/);
  assert.match(html, /const list = splitDetailLines\(items\);/);
  assert.match(html, /const details = splitDetailLines\(\[/);
});

test('checkout goes straight to the payment provider, which refuses framing', () => {
  assert.match(html, /location\.href = url;/);
  assert.doesNotMatch(html, /demoPayModal/);
  assert.match(html, /en\?"Pay now":"ชำระเงิน"/);
  assert.doesNotMatch(html, /Create payment link/);
});

test('the Wise option leads with its logo', () => {
  assert.match(html, /payment-wise-title/);
  assert.doesNotMatch(html, /<span>🌍 Wise: pay full amount<\/span>/);
});

test('a returning customer sees the document AJ already holds', () => {
  assert.match(html, /function demoIdentityDisplay\(\)/);
  assert.match(html, /demoProfile\.identityOnFileLast4/);
  assert.match(html, /result\.profile\.identityLast4/);
});

test('the demo asks for the document expiry and refuses an expired one', () => {
  assert.match(html, /id="demoIdentityExpiry"/);
  assert.match(html, /function demoIdentityExpired\(\)/);
  assert.match(html, /hasVerifiedAgreementRecord\(\) && !demoIdentityExpired\(\)/);
  assert.match(html, /เอกสารหมดอายุแล้ว ต้องใช้เอกสารที่ยังไม่หมดอายุและทำสัญญาการเช่าใหม่/);
});

test('email is required because the confirmation is sent there', () => {
  assert.match(html, /need\("demoEmail", \/\^\[\^\\s@\]\+@/);
});

test('the Rental ID page can send the customer back to fix a section', () => {
  assert.match(html, /function demoSectionHeadHtml\(title, step\)/);
  assert.match(html, /data-demo-edit="\$\{step\}"/);
});

test('identity artwork is drawn by AJ, not embedded from elsewhere', () => {
  assert.match(html, /function demoIdentityArtHtml\(\)/);
  assert.match(html, /demo-identity-art/);
  assert.doesNotMatch(html, /<img[^>]+identity-illustration/);
});

test('the admin panel manages pickup points', () => {
  assert.match(html, /adminPickupHtml\(\)/);
  assert.match(html, /\/api\/admin\/pickup-locations/);
  assert.match(html, /data-pickup-default/);
  assert.match(html, /ใช้จุดนี้เป็นจุดรับของตอนนี้/);
});

test('the calendar blocks a date only when holds use up every free unit', () => {
  assert.doesNotMatch(html, /if\(allHolds\.some\(hold => hold\.mine\)\) return \{cls:"busy"/);
  assert.match(html, /if\(availableUnitsForRange\(matches, start, end\) > holds\.length\) return \{cls:"available"/);
});

test('payment groups collapse so only one is open at a time', () => {
  assert.match(html, /data-payment-group="reservation"/);
  assert.match(html, /data-payment-group="full"/);
  assert.match(html, /\.payment-group\.is-collapsed \.payment-group-body\{display:none\}/);
});

test('slow steps show a busy veil and edits open in a dialog', () => {
  assert.match(html, /function showDemoBusy\(message\)/);
  assert.match(html, /id="demoEditModal"/);
  assert.match(html, /function openDemoEditModal\(step\)/);
});

test('the About page can be edited by the shop and read by everyone', () => {
  assert.match(html, /\/api\/site-content\/about/);
  assert.match(html, /\/api\/admin\/site-content\/about/);
  assert.match(html, /function adminAboutHtml\(\)/);
  assert.doesNotMatch(html, /info-modal-highlight"><div><strong>\$\{esc\(copy\.aboutSince\)\}/);
});

test('the form survives a refresh without keeping the document number in the browser', () => {
  assert.match(html, /const DEMO_PROFILE_KEY = "aj_demo_profile_v1"/);
  assert.match(html, /const DEMO_PROFILE_TTL_MS = 24 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(html, /DEMO_PROFILE_FIELDS = \[[^\]]*"identityNumber"/);
  assert.match(html, /\/api\/identity-drafts/);
  assert.match(html, /identityDraftId: UNIFIED_FLOW_DEMO && !state\.calc\.noContract \? demoProfile\.identityDraftId : ""/);
});

test('the payment page offers the identity link and clears the saved form', () => {
  const success = fs.readFileSync(new URL('../payment-success.html', import.meta.url), 'utf8');
  assert.match(success, /identity-link/);
  assert.match(success, /localStorage\.removeItem\("aj_demo_profile_v1"\)/);
  assert.match(success, /ยืนยันตัวตนตอนนี้/);
  assert.match(success, /Verify now/);
});

test('delivery is part of the total, the card fee covers it, and each option shows pay-now and on-delivery', () => {
  assert.match(html, /const subtotalBeforePaymentFee = totalBeforeDelivery \+ delivery;/);
  assert.match(html, /const paymentFee = paymentFeeAmount\(subtotalBeforePaymentFee\);/);
  assert.match(html, /function paymentScheduleHtml\(summary\)/);
  assert.match(html, /\$\{quote \? paymentScheduleHtml\(summary\) : ""\}/);
  assert.match(html, /ชำระตอนนี้/);
  assert.match(html, /ชำระตอนรับเครื่อง/);
  assert.match(html, /Pay on delivery/);
  // The amounts sit in their own column beside the option's description.
  assert.ok(html.includes('${copy}${paymentOptionAmountHtml(value)}</label>'));
  // The Beam base amount is the same figure the fee was taken from.
  assert.match(html, /baseAmount: Number\(summary\.subtotalBeforePaymentFee\) \|\| 0/);
});

test('the order page asks for a fresh delivery quote after a refresh or an edit', () => {
  assert.match(html, /function demoDeliveryQuoteKey\(\)/);
  assert.match(html, /if\(state\.calc\.demoOrderOpen && demoDelivery\.status !== "loading" && demoDelivery\.key !== demoDeliveryQuoteKey\(\)\)\{\n      void fetchDemoDeliveryQuote\(\);/);
  assert.match(html, /demoDelivery\.key = demoDeliveryQuoteKey\(\);/);
});

test('the Rental ID page opens at the preparation notice', () => {
  assert.match(html, /function scrollToDemoOrderTop\(\)/);
  assert.match(html, /document\.querySelector\("\.prep-time-brief"\)/);
  assert.doesNotMatch(html, /byId\("demoOrderPage"\)\?\.scrollIntoView/);
});

test('a map link without a pin explains the fix, and the current location can fill it', () => {
  assert.match(html, /function useDemoCurrentLocation\(\)/);
  assert.match(html, /demoProfile\.maps = `https:\/\/maps\.google\.com\/\?q=\$\{lat\},\$\{lng\}`/);
  assert.match(html, /📍 ใช้ตำแหน่งปัจจุบัน/);
  assert.match(html, /📍 Use my current location/);
  assert.match(html, /class="demo-pin-help"/);
});

test('each payment option shows "Pay now" and "Pay on delivery" on their own lines', () => {
  assert.match(html, /line\(en \? "Pay now" : "ชำระตอนนี้", amounts\.payNow\)/);
  assert.match(html, /method === "cash" \? line\(en \? "Pay on delivery" : "ชำระปลายทาง", amounts\.onDelivery\)/);
  assert.match(html, /ยอดด้านล่างยังไม่รวมค่าจัดส่ง/);
  assert.match(html, /Amounts below do not yet include delivery\./);
});

test('re-ticking the returning discount after verifying applies it, through the same rule as the booking page', () => {
  assert.match(html, /if\(event\.target\.id === "retOpt" \|\| event\.target\.id === "demoReturningOpt"\)\{/);
  assert.doesNotMatch(html, /if\(event\.target\.id === "demoReturningOpt"\)\{/);
  assert.match(html, /\$\{state\.calc\.ret \? demoReviewDiscountsHtml\(\) : ""\}/);
});

test('an agreement that already covers the renter sends step 2 straight to payment', () => {
  assert.match(html, /function demoIdentityStepSkippable\(\)\{\n    return demoIdentityCoveredByAgreement\(\) \|\| !!state\.calc\.noContract;/);
  assert.match(html, /UNIFIED_FLOW_DEMO && step === 2 && demoIdentityStepSkippable\(\)\n        \? `<button class="btn primary" id="demoConfirmFromDetails"/);
  assert.match(html, /if\(targetId === "demoConfirmFromDetails"\)\{\n        if\(!showDemoStep2Problems\(\)\) return;\n        await confirmDemoOrder\(\);/);
});

test('a renter without a valid agreement signs one on step 3, through the contract service', () => {
  assert.match(html, /<div class="card demo-only" id="demoAgreementCard" hidden><\/div>/);
  assert.match(html, /function demoAgreementNeeded\(\)\{\n    return UNIFIED_FLOW_DEMO && !demoIdentityCoveredByAgreement\(\) && !state\.calc\.noContract;/);
  assert.match(html, /\/api\/booking-context\/\$\{encodeURIComponent\(contextToken\)\}\/agreement/);
  assert.match(html, /demoAgreement\.signature = canvas\.toDataURL\("image\/png"\)/);
  assert.match(html, /if\(step === 3\) return stepReady\(2\) && \(!UNIFIED_FLOW_DEMO \|\| \(demoIdentityReady\(\) && demoAgreementReady\(\)\)\);/);
  assert.match(html, /await submitDemoAgreement\(handoff\.contextToken\);/);
  // The signature and account number never reach this browser's storage.
  const fields = html.match(/const DEMO_PROFILE_FIELDS = \[([^\]]+)\]/)[1];
  assert.doesNotMatch(fields, /signature|refundAccountNumber|account"/);
  assert.match(html, /ลายเซ็นนี้ใช้ในสัญญาเช่า \(PDF\)/);
  assert.match(html, /Your signature goes on the rental agreement PDF/);
});

test('step 3 has a collapsed guide for preparing ID photos, in both languages', () => {
  assert.match(html, /<details class="demo-id-guide" id="demoIdGuide" \$\{demoIdGuideOpen \? "open" : ""\}>/);
  assert.match(html, /ตัวอย่างวิธีการเตรียมบัตร \(กดเพื่ออ่าน\)/);
  assert.match(html, /How to prepare your ID photos \(tap to read\)/);
  assert.match(html, /สามารถใช้สำเนาบัตรประชาชนมาถือคู่และถ่ายเซลฟี่ได้/);
});

test('the reservation note puts the balance rule on its own line', () => {
  assert.match(html, /\[\]\.concat\(methodNote\)\.map\(esc\)\.join\("<br>"\)/);
  assert.match(html, /"ยอดที่เหลือชำระตอนรับเครื่อง: เงินโอนไม่มีค่าธรรมเนียม/);
  assert.match(html, /"Balance on delivery: Thai QR scan with no fee/);
});

test('a failed queue check on confirm opens a retry dialog that carries on to payment', () => {
  assert.match(html, /async function confirmDemoOrder\(\)\{\n    if\(demoQueueCheckFailed\(\)\)\{ showQueueRetryDialog\(\); return; \}/);
  assert.match(html, /await fetchAvailability\(\)\.catch\(\(\) => \{\}\);/);
  assert.match(html, /closeModal\(\);\n    render\(\);\n    await openDemoOrder\(\);/);
  assert.match(html, /if\(String\(error\?\.message \|\| ""\) === "booking_availability_refresh_failed"\)\{ showQueueRetryDialog\(\); return; \}/);
  assert.match(html, /ลองเช็คคิวอีกครั้ง/);
  assert.match(html, /Check the queue again/);
});

test('status colours, the motorcycle rule and the quoted delivery on the booking', () => {
  assert.match(html, /<b class="demo-status is-awaiting">/);
  assert.match(html, /demoProfile\.identityUploaded \? "pending" : "is-missing";/);
  assert.match(html, /\/api\/booking-context\/\$\{encodeURIComponent\(state\.calc\.demoContextToken\)\}\/delivery/);
});

test('the deposit refund block matches the LINE form, with Wise details for passport holders', () => {
  assert.match(html, /function demoWiseEligible\(\)\{\n    return state\.lang === "en";/);
  assert.match(html, /\.option-row\[hidden\],\.demo-profile-grid\[hidden\],\.demo-wise-panel\[hidden\]\{display:none!important\}/);
  assert.match(html, /Security Deposit Refund Account/);
  assert.match(html, /No cash refunds under any circumstances\./);
  assert.match(html, /Wise Refund Details/);
  assert.match(html, /Do not have these details yet\? Pick one of these instead\./);
  for (const key of ['wiseFullName','wiseCountry','wiseCurrency','wiseBankName','wiseAccountNumber','wiseSwift','wiseEmail']) assert.ok(html.includes(`"${key}"`), key);
  // Signing only records the agreement; the contract waits for payment.
  assert.match(html, /if\(!response\.ok \|\| !\(result\.pending \|\| result\.signed\)\)\{/);
});

test('the trial ฿1 charge is one switch; live, every option but Wise goes through Beam at its real amount', () => {
  assert.match(html, /const UNIFIED_FLOW_TEST_CHARGE = true;/);
  assert.match(html, /if\(UNIFIED_FLOW_TEST_CHARGE\) return 1;\n      return state\.calc\.payment === "wise" \? 0 : paymentAmountsFor\(state\.calc\.payment, summary\)\.payNow;/);
  assert.match(html, /bookingFetch\(UNIFIED_FLOW_DEMO && UNIFIED_FLOW_TEST_CHARGE \? CONFIG\.beamPaymentApiDemo : CONFIG\.beamPaymentApi,/);
});

test('the no-identity choice reads as a plain rule and the higher deposit is flagged in red', () => {
  assert.match(html, /"You must still accept AJ's Rental Terms\." : "ลูกค้ายังคงต้องยอมรับเงื่อนไขการเช่าของทางร้าน"/);
  assert.match(html, /\*ไม่ยืนยันตัวตน ค่าประกันสูงขึ้น/);
  assert.match(html, /\*No identity verification — higher deposit/);
  assert.match(html, /\.demo-deposit-note\{margin:2px 0 0;color:#c00000/);
});

test('the payment page confirms with AJ, shows what was received and any balance, and the main page says so', () => {
  const success = fs.readFileSync(new URL('../payment-success.html', import.meta.url), 'utf8');
  assert.match(success, /api\/payments\/confirm-return/);
  assert.match(success, /ยอดคงเหลือชำระตอนรับเครื่อง: \$\{result\.onDelivery\}/);
  assert.match(success, /Balance to pay on delivery: \$\{result\.onDelivery\}/);
  assert.match(success, /กด LINE เพื่อผูกบัญชีและรับข้อความยืนยันการเช่า/);
  assert.doesNotMatch(success, /รับ Flex ยืนยันการเช่า/);
  assert.match(success, /&paid=\$\{encodeURIComponent\(rentalCode\)\}/);
  assert.match(html, /function takePaidRentalReturn\(\)/);
  assert.match(html, /function showPaidRentalNotice\(\{code, amount, balance, emailed\}\)/);
  assert.match(html, /ยอดคงเหลือชำระตอนรับเครื่อง: \$\{balance\}/);
});

test('the game picker fits foldables and lets the renter choose the cover size', () => {
  const picker = fs.readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(picker, /@media \(max-width: 640px\) \{/);
  assert.match(picker, /@media \(max-width: 640px\), \(max-width: 900px\) and \(max-height: 960px\) and \(max-aspect-ratio: 6\/5\) \{/);
  assert.match(picker, /function cyclePickSize\(\)/);
  assert.match(picker, /localStorage\.setItem\('aj_pick_size', pickSize\)/);
  assert.match(picker, /\.pick-selected-chips:empty \{ display: none; \}/);
});

test('a deleted built-in game stays deleted after reload and sync', () => {
  const picker = fs.readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
  assert.match(picker, /if \(!isDeletedGame\(id\)\) deletedGameIds\.push\(id\);/);
  assert.match(picker, /deletedGameIds: deletedGameIds,/);
  assert.match(picker, /localStorage\.setItem\('ajgame_deleted', JSON\.stringify\(deletedGameIds\)\);/);
  // Every place the built-in list is merged back respects the deletions.
  const merges = picker.match(/DEFAULT_GAMES\.forEach\([^\n]*games\.push/g) || [];
  assert.ok(merges.length >= 3);
  for (const line of merges) assert.match(line, /isDeletedGame\(dg\.id\)/);
});
