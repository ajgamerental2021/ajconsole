import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../rental-flow-demo.html', import.meta.url), 'utf8');

test('unified flow is the production default and legacy flow remains available for rollback', () => {
  assert.match(entry, /flowDemo', '1'/);
  assert.match(entry, /booking', '1'/);
  assert.match(html, /const UNIFIED_FLOW_DEMO = PAGE_PARAMS\.get\("legacyFlow"\) !== "1"/);
  assert.match(html, /body\.classList\.add\("unified-flow-demo"\)/);
});

test('demo reuses live game and adds customer, identity and payment stages', () => {
  assert.match(html, /demoGameHost/);
  assert.match(html, /demoIdentityCard/);
  assert.match(html, /demoOrderPage/);
  assert.match(html, /demoCustomerName/);
  assert.match(html, /demoCustomerPhone/);
  assert.match(html, /demoIdentityNumber/);
  assert.match(html, /id="\$\{prefix\}SelfieWithId" data-identity-file="selfie"/);
  assert.match(html, /\$\{demoIdentityUploadGridHtml\("demo"\)\}/);
  assert.match(html, /demoTermsOpt/);
  assert.match(html, /beamPaymentApiDemo/);
});

test('demo customer details are included in the real booking context', () => {
  assert.match(html, /customerName: String\(UNIFIED_FLOW_DEMO \? demoProfile\.fullName/);
  assert.match(html, /phone: thaiPhoneText\(UNIFIED_FLOW_DEMO \? demoProfile\.phone/);
  assert.match(html, /identityVerificationStatus/);
  assert.match(html, /deliveryAddress/);
  assert.match(html, /customerDataSource: UNIFIED_FLOW_DEMO/);
});

test('demo identity data stays in page memory and no-contract deposit uses the proposed tiers', () => {
  assert.match(html, /const demoProfile = \{/);
  assert.match(html, /function noContractDeposit\(base, selectedConsole\)/);
  assert.match(html, /FIVE_THOUSAND_DEPOSIT_IDS/);
  assert.doesNotMatch(html, /\? 8000 : 5000/);
  assert.match(html, /Full identity numbers and images deliberately stay out of localStorage/);
});

test('verify later keeps already selected identity photos', () => {
  assert.match(html, /Your selected photos are still kept on this page/);
  assert.match(html, /รูปที่เลือกไว้ยังอยู่ในหน้านี้/);
  const skipHandler = html.slice(html.indexOf('if(event.target.id === "demoIdentitySkip")'), html.indexOf('if(event.target.classList?.contains("demo-camera-input"'));
  assert.doesNotMatch(skipHandler, /idDocument\s*=\s*null/);
  assert.doesNotMatch(skipHandler, /selfieWithId\s*=\s*null/);
});

test('payment success handoff can request confirmation-only LINE Flex', () => {
  const success = fs.readFileSync(new URL('../payment-success.html', import.meta.url), 'utf8');
  assert.match(success, /confirmationOnly/);
  assert.match(success, /flowDemo/);
  assert.match(html, /const confirmationOnly = params\.get\("confirmationOnly"\) === "1"/);
  assert.match(html, /JSON\.stringify\(\{lineAccessToken:accessToken, confirmationOnly\}\)/);
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

test('step 2 uses the map and note; identity number follows the document upload in step 3', () => {
  const customer = html.slice(html.indexOf('card.innerHTML = `<h3>${en ? "Customer and delivery details"'), html.indexOf('function demoAddressText'));
  assert.match(html, /id="demoNoContractOpt"/);
  assert.match(html, /id="demoDeliveryInstructions"/);
  assert.doesNotMatch(customer, /for="demoIdentityNumber"|for="demoAddressLine"|id="demoNoThaiAddress"/);
  assert.ok(html.indexOf('demoIdentityUploadGridHtml("demo")') < html.indexOf('demoIdentityFieldsHtml()', html.indexOf('demoIdentityUploadGridHtml("demo")')));
});

test('document type is chosen separately from the page language', () => {
  assert.match(html, /name="demoIdentityType" value="passport"/);
  assert.match(html, /return demoProfile\.identityType \|\| \(state\.lang === "en" \? "passport" : "thai_id"\)/);
  assert.match(html, /demoIdentityType\(\) === "passport" \? \/\^\[A-Z0-9\]\{6,10\}\$\/i\.test\(identity\) : thaiIdValid\(identity\)/);
  assert.match(html, /identityType: UNIFIED_FLOW_DEMO && !state\.calc\.noContract \? demoIdentityType\(\) : ""/);
});

test('step 2 no longer asks for postal code or street fields', () => {
  const customer = html.slice(html.indexOf('card.innerHTML = `<h3>${en ? "Customer and delivery details"'), html.indexOf('function demoAddressText'));
  assert.doesNotMatch(customer, /id="demoPostalCode"|id="demoSubdistrict"|id="demoDistrict"|id="demoProvince"|id="demoAddressLine"/);
  assert.match(customer, /id="demoMaps"/);
});

test('Rental Terms are embedded and acceptance is recorded', () => {
  assert.match(html, /class="demo-terms-frame"/);
  assert.match(html, /demoProfile\.termsAccepted = event\.target\.checked/);
  assert.doesNotMatch(html, /demoProfile\.termsRead/);
});

test('identity uploads offer a camera and an example photo', () => {
  assert.match(html, /data-open-camera="\$\{prefix\}IdDocumentCamera"/);
  assert.match(html, /data-identity-example="selfie"/);
  assert.match(html, /capture="user"/);
  assert.match(html, /function showDemoIdentityExample\(kind\)/);
  assert.doesNotMatch(html, /For safety, the separate document image remains required/);
});

test('the delivery map is required and a delivery note is optional', () => {
  assert.match(html, /need\("demoMaps"/);
  assert.match(html, /deliveryInstructions: UNIFIED_FLOW_DEMO/);
  assert.match(html, /id="demoDeliveryInstructions"/);
  assert.doesNotMatch(html.slice(html.indexOf('card.innerHTML = `<h3>${en ? "Customer and delivery details"'), html.indexOf('function demoAddressText')), /id="demoNoThaiAddress"/);
});

test('the in-progress rental session expires after 24 hours on each device', () => {
  assert.match(html, /const RENTAL_SESSION_KEY = "aj_rental_session_v1"/);
  assert.match(html, /const RENTAL_SESSION_TTL_MS = 24 \* 60 \* 60 \* 1000/);
  assert.match(html, /function clearExpiredRentalSession\(\)/);
  assert.match(html, /localStorage\.removeItem\(LS\.draft\)/);
  assert.match(html, /localStorage\.removeItem\("aj_demo_profile_v1"\)/);
  assert.match(html, /url\.searchParams\.delete\("booking"\)/);
  assert.match(html, /location\.replace\(url\.href\)/);
  const boot = html.slice(html.indexOf('async function boot(){'));
  assert.ok(boot.indexOf('clearExpiredRentalSession();') < boot.indexOf('loadState();'));
  assert.doesNotMatch(boot, /cleanBookingUrl\.searchParams\.set\("booking", "1"\)/);
  assert.match(boot, /state\.beforeRentActive = lineConnectReturn \|\| lineProofReturned \? false : !hasRentalContext\(\)/);
  assert.match(boot, /if\(directBookingEntry\)\{[\s\S]*?cleanEntryUrl\.searchParams\.delete\("booking"\)/);
});

test('identity images are uploaded to the booking context before the Rental ID page opens', () => {
  assert.match(html, /\/api\/booking-context\/\$\{encodeURIComponent\(contextToken\)\}\/identity/);
  const openOrder = html.slice(html.indexOf('async function openDemoOrder'), html.indexOf('async function launchDemoBeamPayment'));
  assert.ok(openOrder.indexOf('uploadDemoIdentity(') < openOrder.indexOf('state.calc.demoOrderOpen = true'));
  assert.match(html, /\? \(en \? "Identity verification complete" : "ยืนยันตัวตนเรียบร้อยแล้ว"\)/);
  assert.match(html, /const identityTone = demoIdentityCoveredByAgreement\(\) \|\| demoProfile\.identityUploaded \? "ok" : "is-missing";/);
  // Sent together with the agreement, not one after the other.
  assert.match(openOrder, /await Promise\.allSettled\(\[\n        sendsIdentity/);
  assert.doesNotMatch(html, /are not uploaded by the demo/);
});

test('step 2 marks the fields that still need filling instead of a dead button', () => {
  assert.match(html, /function demoStep2Problems\(\)/);
  assert.match(html, /function showDemoStep2Problems\(\)/);
  assert.match(html, /!UNIFIED_FLOW_DEMO \? stepReady\(step\) : true/);
  assert.match(html, /async function advanceDemoStep\(next\)/);
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
  assert.match(html, /demoDelivery = \{status:"idle", quote:null, key:"", error:""\}/);
  assert.match(html, /Waiting for the live delivery price/);
  assert.ok(html.includes('needs_pin: en ? "Map pin needed" : "ต้องปักหมุดแผนที่"'));
  assert.match(html, /hasLargeItem: deliveryNeedsCar\(\)/);
  assert.match(html, /data-delivery-quote-retry/);
  assert.match(html, /Still calculating the delivery fee\. Please try again in a moment\./);
  assert.match(html, /ยังคำนวณค่าส่งอยู่ กรุณากดอีกครั้งในอีกสักครู่/);
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
  assert.match(html, /demoRentalItemColumnsHtml\(equipment, games\)/);
});

test('rental item cards always keep equipment left and selected games right in both languages', () => {
  assert.match(html, /function demoRentalItemColumnsHtml\(equipmentItems, gameItems\)/);
  assert.match(html, /class="demo-item-columns"/);
  assert.match(html, /tr\("equipmentDetails"\)/);
  assert.match(html, /tr\("selectedGamesHeading"\)/);
  assert.match(html, /selectedGamesHeading:"เกมที่เลือก"/);
  assert.match(html, /selectedGamesHeading:"Selected games"/);
  assert.match(html, /grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(html, /const equipment = \[\n\s*\.\.\.consoleDetails\(item/);
  assert.match(html, /const games = \[\n\s*\.\.\.r\.games\.map/);
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
  assert.match(html, /function paymentPickerHtml\(\{disabled = "", wiseStatus = null, selected = state\.calc\.payment, amountHtml = paymentOptionAmountHtml,/);
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
  assert.match(html, /function applyDemoReturningProfile\(profile/);
  assert.match(html, /applyDemoSavedAddress\(profile\.address\)/);
  assert.match(html, /fill\("email", profile\.email\)/);
  assert.match(html, /saveDemoProfile\(\)/);
  assert.match(html, /applyDemoReturningProfile\(result\.profile/);
});

test('multi-line catalogue details render as separate lines everywhere', () => {
  assert.match(html, /function splitDetailLines\(items\)/);
  assert.match(html, /const list = splitDetailLines\(items\);/);
  assert.match(html, /const equipment = splitDetailLines\(equipmentItems\);/);
  assert.match(html, /const games = splitDetailLines\(gameItems\);/);
});

test('checkout goes straight to the payment provider, which refuses framing', () => {
  assert.match(html, /location\.href = url;/);
  assert.doesNotMatch(html, /demoPayModal/);
  assert.match(html, /en \? "Pay now" : "ชำระเงิน"/);
  assert.match(html, /id="demoBeamPay" type="button" \$\{canPay \? "" : "disabled"\}/);
  assert.doesNotMatch(html, /Create payment link/);
});

test('the Wise option leads with its logo', () => {
  assert.match(html, /payment-wise-title/);
  assert.doesNotMatch(html, /<span>🌍 Wise: pay full amount<\/span>/);
});

test('a returning customer sees the document AJ already holds', () => {
  assert.match(html, /function demoIdentityDisplay\(\)/);
  assert.match(html, /demoProfile\.identityOnFileLast4/);
  assert.match(html, /profile\.identityLast4/);
});

test('document expiry is read after photo upload and validated on step 3', () => {
  assert.match(html, /id="demoIdentityExpiry"/);
  assert.match(html, /function demoIdentityExpired\(\)/);
  assert.match(html, /window\.AJIdentityOCR\.recognize\(file\)/);
  assert.match(html, /need\("demoIdentityExpiry", !demoOcr\.busy/);
});

test('email is required because the confirmation is sent there', () => {
  assert.match(html, /need\("demoEmail", demoEmailValid\(demoProfile\.email\), demoEmailMessage\(\)\);/);
  assert.match(html, /รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบ เช่น name@gmail\.com/);
  assert.match(html, /This email address is not valid\. Check it, for example name@gmail\.com\./);
  assert.match(html, /if\(event\.target\.id === "demoEmail"\) showDemoEmailError\(\);/);
  const body = html.match(/function demoEmailValid\(value\)\{\n    return (\/.*\/i)\.test/)[1];
  const valid = new Function(`return ${body}`)();
  for (const good of ['name@gmail.com', 'a.b+c@mail.co.th', 'x@sub.example.org']) assert.ok(valid.test(good), good);
  for (const bad of ['jsbdhxgxhxhxhxhxbbxjx', 'name@gmail', 'name@gmail.c', 'name@.com', 'name@gmail.123', 'a b@x.com', '@x.com']) assert.ok(!valid.test(bad), bad);
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
  assert.ok(html.includes('${copy}${amountHtml(value)}</label>'));
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
  assert.match(html, /demoProfile\.maps = window\.AJPlaceSearch\.pinLink\(at\.lat, at\.lng\);/);
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
  assert.match(html, /if\(targetId === "demoConfirmFromDetails"\)\{\n        await confirmDemoOrder\(\);/);
});

test('a renter without a valid agreement signs one on step 3, through the contract service', () => {
  assert.match(html, /<div class="card demo-only" id="demoAgreementCard" hidden><\/div>/);
  assert.match(html, /function demoAgreementNeeded\(\)\{\n    return UNIFIED_FLOW_DEMO && !demoIdentityCoveredByAgreement\(\) && !state\.calc\.noContract;/);
  assert.match(html, /\/api\/booking-context\/\$\{encodeURIComponent\(contextToken\)\}\/agreement/);
  assert.match(html, /demoAgreement\.signature = canvas\.toDataURL\("image\/png"\)/);
  assert.match(html, /if\(step === 3\) return stepReady\(2\) && \(!UNIFIED_FLOW_DEMO \|\| \(demoIdentityReady\(\) && demoAgreementReady\(\)\)\);/);
  assert.match(html, /\n        submitDemoAgreement\(handoff\.contextToken\)\n      \]\);/);
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

test('confirm checks the queue automatically, retries once, and explains a failure', () => {
  assert.match(html, /async function confirmDemoOrder\(\)\{/);
  assert.match(html, /if\(!\(await checkDemoQueueAutomatically\(\)\)\) return;/);
  assert.match(html, /for\(let attempt = 0; attempt < 2 && !fresh; attempt\+\+\)/);
  assert.match(html, /showDemoBusy\(en \? "Checking availability/);
  assert.match(html, /showQueueRetryDialog\(en \? "The automatic queue check failed twice/);
  assert.match(html, /showDemoProgressProblem\(problems\[0\]\.message\)/);
  assert.match(html, /await confirmDemoOrder\(\);/);
});

test('status colours, the motorcycle rule and the quoted delivery on the booking', () => {
  assert.match(html, /<b class="demo-status is-awaiting">/);
  assert.match(html, /demoProfile\.identityUploaded \? "ok" : "is-missing";/);
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
  assert.match(html, /const UNIFIED_FLOW_TEST_CHARGE = false;/);
  assert.match(html, /if\(UNIFIED_FLOW_TEST_CHARGE\) return 1;\n      return state\.calc\.payment === "wise" \? 0 : paymentAmountsFor\(state\.calc\.payment, summary\)\.payNow;/);
  assert.match(html, /bookingFetch\(UNIFIED_FLOW_DEMO && UNIFIED_FLOW_TEST_CHARGE \? CONFIG\.beamPaymentApiDemo : CONFIG\.beamPaymentApi,/);
});

test('the no-identity choice reads as a plain rule and the higher deposit is flagged in red', () => {
  // The owner removed the extra "you must still accept the Rental Terms" box.
  assert.doesNotMatch(html, /ลูกค้ายังคงต้องยอมรับเงื่อนไขการเช่าของทางร้าน/);
  assert.match(html, /\*ไม่ยืนยันตัวตน ค่าประกันสูงขึ้น/);
  assert.match(html, /\*No identity verification — higher deposit/);
  assert.match(html, /\.demo-deposit-note\{margin:2px 0 0;color:#c00000/);
});

test('the payment page confirms with AJ, shows what was received and any balance, and the main page says so', () => {
  const success = fs.readFileSync(new URL('../payment-success.html', import.meta.url), 'utf8');
  assert.match(success, /api\/payments\/confirm-return/);
  assert.match(success, /ยอดคงเหลือชำระตอนรับเครื่อง: \$\{result\.onDelivery\}/);
  assert.match(success, /Balance to pay on delivery: \$\{result\.onDelivery\}/);
  assert.match(success, /ระบบกำลังยืนยันยอดและจะส่งข้อมูลการเช่าไปยัง LINE ที่เชื่อมไว้/);
  assert.doesNotMatch(success, /รับ Flex ยืนยันการเช่า/);
  assert.match(success, /index\.html\?myRental=\$\{encodeURIComponent\(rentalCode\)\}/);
  assert.match(success, /url\.searchParams\.set\("t", result\.viewToken\)/);
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
  assert.match(picker, /\.pick-selected-list:empty \{ display: none; \}/);
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

test('payment groups have large headings with the arrow on the left', () => {
  assert.match(html, /aria-expanded="\$\{!fullSelected\}">\$\{caret\(!fullSelected\)\}<span class="payment-group-label">/);
  assert.match(html, /\.payment-group-title\{[^}]*font-size:15\.5px;font-weight:900;color:#101828/);
  assert.match(html, /\.payment-group-caret\{[^}]*width:36px;height:36px/);
  assert.match(html, /\.payment-group:not\(\.is-collapsed\) \.payment-group-title\{background:#c90012;color:#fff/);
  assert.match(html, /\.payment-group\.is-collapsed \.payment-group-caret svg\{transform:rotate\(-90deg\)\}/);
  assert.doesNotMatch(html, /caret\.textContent = open \? "▾" : "▸"/);
  assert.match(html, /\.payment-recommended\{[^}]*font-size:13\.5px/);
});

test('the demo pay button is large, green, and carries a lock icon', () => {
  assert.match(html, /<button class="btn primary demo-pay-btn" id="demoBeamPay" type="button" \$\{canPay \? "" : "disabled"\}><svg viewBox="0 0 24 24" aria-hidden="true">/);
  assert.match(html, /body\.unified-flow-demo \.demo-pay-btn\{width:100%;min-height:60px;[^}]*font-size:20px;font-weight:900/);
  // Green, so it never matches the red open payment group above it.
  assert.match(html, /\.demo-pay-btn\{[^}]*background:linear-gradient\(180deg,#1fa34a,#0f7a34\)/);
});

test('a LINE-verified returning renter sees their saved details as one summary with Edit', () => {
  assert.match(html, /function demoContactCollapsed\(\)\{\n    return UNIFIED_FLOW_DEMO && demoContactFromLine && !demoContactEditing && demoContactComplete\(\);/);
  assert.match(html, /ข้อมูลจากการเช่าครั้งก่อน/);
  assert.match(html, /Your details from your last rental/);
  assert.match(html, /if\(targetId === "demoContactEdit"\)\{ demoContactEditing = true; render\(\);/);
  assert.match(html, /demoContactFromLine = !!\(demoProfile\.fullName \|\| demoProfile\.phone\);/);
  // A missing required field reopens the form rather than hiding the error.
  assert.match(html, /if\(demoContactCollapsed\(\) && demoStep2Problems\(\)\.some\(problem => DEMO_CONTACT_IDS\.includes\(problem\.id\)\)\)\{/);
  // No blank date for a renter verified from rental history.
  assert.match(html, /ยืนยันตัวตนแล้วจากประวัติการเช่า ครั้งนี้ไม่ต้องส่งรูปบัตรอีก/);
});

test('the header menu opens rental prices, the game list and the rental steps like their links do', () => {
  assert.match(html, /\["prices", "tag", en \? "Rental prices" : "ราคาเช่า"\], \["games", "gamepad", en \? "Game list" : "รายการเกม"\], \["steps", "steps", en \? "How to rent" : "วิธีเช่า"\], \["myRental", "receipt", en \? "My rental" : "คิวเช่าของฉัน"\], \["faq", "help", tr\("beforeRentFaq"\)\]/);
  // Line icons drawn like the site's other icons, not emoji.
  assert.match(html, /\$\{icon\(iconName, "site-menu-ico"\)\}<span>\$\{esc\(label\)\}<\/span>/);
  assert.match(html, /const infoIcons = \{about:"info", privacy:"shield", terms:"doc", contact:"contact"\};/);
  assert.match(html, /if\(action === "prices"\) showAllConsoles\(\);/);
  assert.match(html, /if\(action === "games"\) openGamePicker\(\{browseOnly:true, consoleId:String\(SPEC\.PS5\)\}\);/);
  assert.match(html, /if\(action === "steps"\) openStepsPopup\(\);/);
  // The same functions the ?allConsoles=1, ?games=1 and ?steps=1 links call.
  assert.match(html, /setTimeout\(showAllConsoles, 120\)/);
  assert.match(html, /openGamePicker\(\{browseOnly:true, consoleId:requestedConsole\?\.id \|\| ""\}\)/);
  assert.match(html, /setTimeout\(openStepsPopup, 120\)/);
});

test('a day-range queue closure blocks deliveries and returns on those days only', () => {
  const start = html.indexOf('  function bangkokDayOf(value){');
  const end = html.indexOf('  function queueRulesForItem(item){');
  const overlaps = new Function(`${html.slice(start, end)}; return queueRuleOverlaps;`)();
  const rule = { closed: true, startAt: new Date('2026-09-26T00:00:00+07:00').toISOString(), endAt: new Date('2026-09-28T00:00:00+07:00').toISOString() };
  assert.equal(overlaps(rule, '2026-09-26', '2026-09-29'), true);  // delivery on a closed day
  assert.equal(overlaps(rule, '2026-09-24', '2026-09-27'), true);  // return on a closed day
  assert.equal(overlaps(rule, '2026-09-25', '2026-09-28'), false); // spans the closed days
  assert.equal(overlaps(rule, '2026-09-28', '2026-10-01'), false); // after
  assert.equal(overlaps(rule), false); // the console stays bookable for other dates
  const shut = { closed: true, startAt: '', endAt: '' };
  assert.equal(overlaps(shut), true);
  assert.equal(overlaps(shut, '2026-12-01', '2026-12-04'), true);
  assert.match(html, /<input class="input" type="date" data-queue-start/);
  assert.match(html, /const dayAfter = day => day \?/);
});

test('the site announcement shows on every visit, Thai left and English right, and is edited in Admin', () => {
  assert.match(html, /<div class="site-announcement" id="siteAnnouncement" role="alertdialog"/);
  assert.match(html, /<span class="site-announcement-icon" aria-hidden="true">⚠️<\/span>/);
  assert.match(html, /void loadSiteAnnouncement\(\)\.then\(applySiteAnnouncement\);/);
  // The server setting is requested before the main script runs. A notice
  // disabled in Admin must never flash from stale browser storage.
  const early = html.indexOf('window.__ajAnnouncementRequest = fetch(');
  assert.ok(early > html.indexOf('id="siteAnnouncementOk"') && early < html.indexOf('const CONFIG'));
  assert.doesNotMatch(html, /localStorage\.getItem\("aj_site_announcement"\)/);
  assert.match(html, /if\(content\?\.enabled\) showSiteAnnouncement\(content\);/);
  assert.match(html, /if\(siteAnnouncementDismissed\) return;/);
  assert.match(html, /\$\{announcementColumnHtml\(content\.th, "th"\)\}\$\{announcementColumnHtml\(content\.en, "en"\)\}/);
  assert.match(html, /\.site-announcement\{position:fixed;inset:0;z-index:100000/);
  assert.match(html, /\/api\/admin\/site-content\/announcement/);
  assert.match(html, /📢 แจ้งหยุดรับจองเครื่องเช่าชั่วคราว/);
  assert.match(html, /📢 Temporary Rental Booking Notice/);
  assert.match(html, /announcement: en \? "Announcement" : "ประกาศ"/);
});

test('the ID card or passport must expire after the return date, or the renter cannot continue', () => {
  const start = html.indexOf('function demoIdentityExpiryIssue(){');
  const end = html.indexOf('function demoIdentityExpired(){', start);
  const body = html.slice(start, end).replace('function demoIdentityExpiryIssue(){', '').replace(/}\s*\/\/[^\n]*\n?\s*$/, '').trim().replace(/}$/, '');
  const issue = (expiry, calc) => new Function('demoProfile', 'state', 'todayIso', body)({identityExpiry: expiry}, {calc}, () => '2026-09-26');
  const rental = {start: '2026-10-28', end: '2026-10-31'};
  assert.equal(issue('2026-09-25', rental), 'expired');
  assert.equal(issue('2026-10-27', rental), 'before_start');
  assert.equal(issue('2026-10-29', rental), 'during_rental');
  assert.equal(issue('2026-10-31', rental), 'on_return');
  assert.equal(issue('2026-11-01', rental), '');
  assert.equal(issue('', rental), '');
  assert.match(html, /need\("demoIdentityExpiry", !demoOcr\.busy/);
  assert.match(html, /field:"demoIdentityExpiry"/);
  assert.match(html, /step:3, field:"demoIdentityExpiry"/);
});
test('a renter checks a rental without an account: this device, the email link, Rental ID or email plus phone', () => {
  assert.match(html, /if\(action === "myRental"\) openMyRentalLookup\(\{code:menuAction\.dataset\.myRentalOpen \|\| ""\}\);/);
  assert.match(html, /fetch\(`\$\{CONFIG\.apiBase\}\/api\/rentals\/lookup`/);
  // A rental made on this device opens with one tap, through its private token.
  assert.match(html, /if\(token\)\{ void runMyRentalLookup\(\{rentalCode:code, viewToken:token\}\); return; \}/);
  assert.match(html, /if\(result\.viewToken\) rememberRental\(code, result\.viewToken\);/);
  // An email address instead of the Rental ID.
  assert.match(html, /const query = identifier\.includes\("@"\)\n      \? \{email:identifier, phone:myRentalView\.phone\}/);
  // The email link's token opens the rental and is removed from the address bar.
  assert.match(html, /url\.searchParams\.delete\("t"\)/);
  // Language button and a copy-link button, in both languages.
  assert.match(html, /showModal\(state\.lang === "en" \? "My rental" : "คิวเช่าของฉัน", myRentalModalBody\(\), \{relocalize:renderMyRentalModal\}\);/);
  assert.match(html, /if\(targetId === "myRentalCopyUrl"\)\{ void copySectionUrl\("myRental"\); return; \}/);
  assert.match(html, /en \? "Copy link to this page" : "คัดลอกลิงก์หน้านี้"/);
  // The paid pop-up shows the rental and can switch language.
  assert.match(html, /showModal\(state\.lang === "en" \? "Rental confirmed" : "การเช่าสำเร็จ", paidRentalNoticeHtml\(\), \{relocalize:renderPaidRentalNotice\}\);/);
  assert.match(html, /WhatsApp customers: take a screenshot of this page and send it to the chat where you contacted AJ\./);
  assert.match(html, /: "ดูรายการนี้ได้ตลอด ที่ เมนู → คิวเช่าของฉัน";/);
  assert.doesNotMatch(html, /ดูรายการนี้ได้อีกตลอด/);
  for (const label of ['"Equipment" : "เครื่องที่เช่า"', '"Start date" : "วันที่เริ่มเช่า"', '"Return date" : "วันที่คืนเครื่อง"', '"Rental days" : "จำนวนวันเช่า"', '"Rental fee" : "ค่าเช่า"', '"Security deposit" : "ค่าประกัน"', '"Customer name" : "ชื่อลูกค้า"', '"Phone" : "เบอร์โทร"', '"Verify my identity now" : "ยืนยันตัวตนตอนนี้"']) {
    assert.ok(html.includes(label), label);
  }
});

test('pop-ups that can switch language share one language button', () => {
  assert.match(html, /function showModal\(title, bodyHtml, \{relocalize = null\} = \{\}\)\{/);
  assert.match(html, /byId\("faqLangBtn"\)\.addEventListener\("click", toggleSimpleModalLang\);/);
  assert.match(html, /showModal\("FAQ", faqModalBody\(\), \{relocalize:draw\}\);/);
  // The returning-customer check has its own language button and wording.
  assert.match(html, /id="returningVerifyLang"/);
  assert.match(html, /returningVerifyNoIdentity:"ไม่เคยยืนยันตัวตน"/);
  assert.match(html, /returningVerifyNoIdentity:"I have never verified my identity"/);
});

test('Verify now opens the identity photos in a pop-up, not step 3', () => {
  assert.match(html, /if\(targetId === "demoVerifyLater"\)\{ openVerifyNowModal\(\); return; \}/);
  assert.match(html, /\$\{demoIdentityUploadGridHtml\("verifyNow"\)\}/);
  assert.match(html, /await uploadDemoIdentity\(token\);/);
});

test('the Rental ID stays the same when only the payment choice or delivery quote changes', () => {
  const signature = html.slice(html.indexOf('function rentalSignature('), html.indexOf('function demoAgreementSignature('));
  assert.doesNotMatch(signature, /state\.calc\.payment|summary\.total/);
  assert.match(html, /if\(localStorage\.getItem\(`aj_rental_sheet_submitted_\$\{code\}`\) === contentKey\) return true;/);
  assert.match(html, /if\(demoAgreementNeeded\(\) && state\.calc\.demoAgreementFor !== code\)\{/);
  assert.match(html, /previousContextToken:String\(state\.calc\.demoContextToken \|\| ""\)/);
});

test('the example photos fit the screen', () => {
  assert.match(html, /\.demo-example-image\{display:block;max-width:100%;width:auto;height:auto;max-height:calc\(100dvh - 190px\);object-fit:contain/);
});

test('Admin → Rentals finds a rental and sends its confirmation email again', () => {
  assert.match(html, /rentals: en \? "Rentals" : "รายการเช่า",/);
  assert.match(html, /adminRentalRequest\(`\/api\/admin\/rentals\/\$\{encodeURIComponent\(adminRental\.code\)\}\/resend-confirmation`, \{method:"POST", body:JSON\.stringify\(\{email\}\)\}\)/);
  assert.match(html, /en \? "Send confirmation email again" : "ส่งอีเมลยืนยันอีกครั้ง"/);
  assert.match(html, /Authorization:`Bearer \$\{state\.adminToken\}`/);
});

test('editing the rental period on the Rental ID page opens only the queue calendar', () => {
  assert.match(html, /demoSectionHeadHtml\(en \? "Rental period" : "ช่วงเวลา", "dates"\)/);
  assert.match(html, /if\(demoEdit\.dataset\.demoEdit === "dates"\) openCalendar\("start", \{fromOrder:true\}\)/);
  // Clearing inside that calendar must not drop the booking's dates or Rental ID.
  assert.match(html, /function clearCalendarRange\(\)\{\n    if\(state\.calendar\.fromOrder\)\{/);
});

test('connecting LINE opens the phone app directly and restores the booking step', () => {
  assert.match(html, /const LINE_CONNECT_HANDOFF_KEY = "aj_line_connect_handoff_v1"/);
  assert.match(html, /new URL\(`line:\/\/app\/\$\{CONFIG\.lineLiffId\}`\)/);
  assert.match(html, /id="lineConnectBtn" href="\$\{pendingLineConnectHandoff\(\) \? esc\(lineConnectionAppUrl\(/);
  assert.doesNotMatch(html, /window\.open\("about:blank"/);
  assert.match(html, /completeLineConnectionHandoff\(\)/);
  assert.match(html, /lineAccessToken:accessToken/);
  const connection = html.slice(html.indexOf('async function completeLineConnectionHandoff(){'), html.indexOf('function takeLineConnectionProofFromHash(){'));
  assert.match(connection, /liff\.init\(\{liffId:CONFIG\.lineLiffId\}\)/);
  assert.doesNotMatch(connection, /withLoginOnExternalBrowser:true/);
  assert.match(connection, /if\(!liff\.isInClient\?\.\(\)\)\{/);
  assert.doesNotMatch(connection, /id="lineConnectReturn"/);
  assert.match(connection, /liff\.openWindow\(\{url:returnUrl\.href,external:true\}\)/);
  assert.doesNotMatch(connection, /id="lineReturnFallback"/);
  assert.match(connection, /if\(!response\.ok \|\| !result\.ok\) throw new Error\(result\.error/);
  assert.match(connection, /location\.replace\(returnUrl\.href\)/, 'legacy direct links retain a fallback');
  assert.doesNotMatch(html, /liff\.login\(\{redirectUri:lineConnectReturnUrl\(\)\}\)/);
  const boot = html.slice(html.indexOf('async function boot(){'));
  assert.match(boot, /if\(lineConnectReturn \|\| lineProofReturned\)\{\n      state\.calc\.step = lineConnectReturn\?\.step \|\| 2;/);
  assert.match(boot, /if\(lineConnectReturn\) void pollLineConnectHandoff\(\)/);
  assert.match(html, /saveVerifiedLineConnection\(result\)/);
  assert.match(html, /toast\(tr\("contactLineConnected"\)\)/);
  assert.match(html, /\/api\/customers\/line-connection\/start/);
  assert.match(html, /pending\.launchedAt = Date\.now\(\)/);
  assert.match(html, /ensureLineConnectHandoff\(\)\.then\(ready => \{/);
  assert.doesNotMatch(html, /contactLineReady:/);
  assert.doesNotMatch(html, /contactEmailSelected:/);
  assert.match(html, /contactLineBrowserNote:"หมายเหตุ:.*Chrome และ Safari เท่านั้น"/);
  assert.match(html, /contactLineBrowserNote:"Note:.*Chrome and Safari only\."/);
  assert.match(html, /if\(UNIFIED_FLOW_DEMO && !payResume\.active && !activeLineConnection\(\) && \(state\.calc\.step === 2 \|\| !state\.beforeRentActive\)\) void ensureLineConnectHandoff\(\)/);
});

test('Admin → Rentals offers the renter\'s own My rental link in Thai and English', () => {
  assert.match(html, /function adminMyRentalLinksHtml\(rental\)/);
  assert.match(html, /\$\{adminMyRentalLinksHtml\(rental\)\}/);
  assert.match(html, /open\(rental\.myRentalUrlTh, "คิวเช่าของฉัน \(ไทย\)"\)/);
  assert.match(html, /open\(rental\.myRentalUrlEn, "My rental \(English\)"\)/);
  assert.match(html, /data-copy-my-rental="\$\{lang\}"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('a returning renter still sees the saved map and customer summary card', () => {
  const body = html.match(/function demoAddressGuess\(text, candidates\)\{[\s\S]*?\n  \}\n/)[0];
  const demoAddressGuess = new Function(`${body}; return demoAddressGuess;`)();
  const c = (sub, district) => ({ sub: [sub, sub], district: [district, district], province: ['กรุงเทพมหานคร', 'Bangkok'] });
  const zip10510 = [c('มีนบุรี', 'เขตมีนบุรี'), c('แสนแสบ', 'เขตมีนบุรี'), c('ทรายกองดิน', 'เขตคลองสามวา'), c('ทรายกองดินใต้', 'เขตคลองสามวา'), c('บางชัน', 'เขตคลองสามวา')];
  assert.equal(demoAddressGuess('Djcj ทรายกองดิน เขตคลองสามวา กรุงเทพมหานคร 10510', zip10510).sub[0], 'ทรายกองดิน');
  assert.equal(demoAddressGuess('99 แขวงทรายกองดินใต้ คลองสามวา', zip10510).sub[0], 'ทรายกองดินใต้');
  assert.equal(demoAddressGuess('บ้านเลขที่ 1 กรุงเทพ', zip10510), null);
  assert.match(html, /const guess = demoAddressGuess\(demoProfile\.addressLine, demoAddressCandidates\);/);
  // A saved one-line address is enough when it cannot be split, and is sent once, not doubled.
  assert.match(html, /demoProfile\.addressFromProfile = true;/);
  assert.match(html, /const keys = \["fullName","phone","email","maps"\]/);
  assert.match(html, /deliveryAddress: UNIFIED_FLOW_DEMO \? demoAddressText\(\) : "",/);
  // After a reload the postal code's areas come back and the summary stays.
  assert.match(html, /if\(\/\^\\d\{5\}\$\/\.test\(String\(demoProfile\.postalCode \|\| ""\)\.trim\(\)\)\) void onDemoPostalCode\(demoProfile\.postalCode\);/);
  assert.match(html, /if\(state\.calc\.retVerified && \(demoProfile\.fullName \|\| demoProfile\.phone\)\) demoContactFromLine = true;/);
});

test('the identity step is greyed out and cannot be opened when nothing is left to verify', () => {
  assert.match(html, /const skipped = UNIFIED_FLOW_DEMO && n === 3 && demoIdentityStepSkippable\(\);/);
  assert.match(html, /\$\{skipped\?'disabled data-step-disabled="1"':""\}/);
  assert.match(html, /"Not needed" : "ไม่ต้องยืนยัน"/);
  assert.match(html, /if\(UNIFIED_FLOW_DEMO && state\.calc\.step === 3 && demoIdentityStepSkippable\(\)\) state\.calc\.step = 2;/);
  assert.match(html, /\.step-tab\.skipped,\.step-tab\.skipped\.done\{background:#f2f4f7!important/);
});

test('every picked game stays in view on a phone, buttons are one line, covers carry the pick number', () => {
  const picker = fs.readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
  // One list component, no height cap or inner scroll anywhere (base, phone or embed).
  assert.match(picker, /<ol class="pick-selected-list" id="pick-chips"><\/ol>/);
  assert.doesNotMatch(picker, /pick-selected-chips|pick-chip-num|max-height:44px/);
  assert.doesNotMatch(picker, /\.pick-selected-list \{[^}]*max-height/);
  assert.match(picker, /\.pick-selected-list \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(picker, /<button type="button" class="pick-selected-remove"/);
  // Short labels live once, in both languages.
  for (const [key, th, en] of [['btn_generate', 'แจ้งร้าน', 'Notify AJ'], ['btn_send_games', 'ส่งรายการเกม', 'Send games'], ['btn_send_update', 'ส่งรายการใหม่', 'Send update'], ['btn_use_list', '✅ ใช้รายการนี้', '✅ Use this list']]) {
    assert.match(picker, new RegExp(`${key}: '${th}'`));
    assert.match(picker, new RegExp(`${key}: '${en}'`));
  }
  assert.doesNotMatch(picker, /สร้างข้อความเพื่อแจ้งทางร้าน|Send selected games|ส่งรายการเกมที่แก้ไข|ใช้รายการเกมนี้/);
  assert.match(picker, /\.pick-footer-actions \.btn \{ white-space: nowrap; \}/);
  assert.match(picker, /onclick="pickPrimaryAction\(\)" id="btn-generate-copy"/);
  assert.match(picker, /btn\.textContent = pickText\('btn_use_list'\);/);
  // The token send keeps its states through one renderer.
  assert.match(picker, /pickSubmitState = 'sending';\n  renderPickActions\(\);/);
  assert.match(picker, /pickSubmitState = 'saved';\n    renderPickActions\(\);/);
  // Covers and list rows show the order number.
  assert.match(picker, /<div class="pick-check">\$\{sel \? pickedGames\.indexOf\(g\.id\) \+ 1 : ''\}<\/div>/);
  assert.match(picker, /<span class="pick-list-order">\$\{pickedGames\.indexOf\(g\.id\) \+ 1\}<\/span>/);
});
