import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import vm from 'node:vm';

// 27/11/2026: the footer names Beam and shows every way to pay; Balance on
// delivery shows the Thai QR mark; the full-payment options drop "pay full
// amount"; "ตรวจสอบข้อมูล" takes the renter to the field; dividers between
// the devices and the two review sections; the rental steps rewritten.

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.search(new RegExp(`\\n  (?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} exists`);
  const from = start + 1;
  return source.slice(from, source.indexOf('\n  }\n', from) + 4);
}
function constant(name) {
  const start = source.search(new RegExp(`\\n  const ${name} = [\\[{]`));
  assert.ok(start >= 0, `${name} exists`);
  const close = source[source.indexOf('=', start) + 2] === '[' ? '\n  ];' : '\n  };';
  return source.slice(start + 1, source.indexOf(close, start) + close.length);
}
const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const qrConst = 'const THAI_QR_LOGO_IMG = ' + source.match(/const THAI_QR_LOGO_IMG = (`[^`]*`);/)[1] + ';';

test('footer: "Payments powered by" Beam, then every payment logo in one row of same-size tiles (TH/EN)', () => {
  assert.match(source, /<div class="site-footer-main"><div class="site-payments"><p class="site-payments-powered"><span data-i18n="sitePaymentsPowered">Payments powered by<\/span><img class="site-beam-logo" src="assets\/payment\/beam\.png" alt="Beam" width="61" height="18"><\/p><div class="pay-logos" id="sitePaymentLogos" role="img"><\/div><\/div><p class="site-copyright"/);
  assert.match(source, /sitePaymentsPowered:"ระบบชำระเงินโดย", sitePaymentsAccepted:"ช่องทางชำระเงินที่รองรับ"/);
  assert.match(source, /sitePaymentsPowered:"Payments powered by", sitePaymentsAccepted:"Accepted payment methods"/);
  assert.ok(existsSync(new URL('../assets/payment/beam.png', import.meta.url)));
  assert.match(source, /\.site-beam-logo\{display:block;height:18px;width:auto\}/);
  assert.match(source, /\.pay-logo\{display:inline-flex;align-items:center;justify-content:center;width:46px;height:30px;/);
  const ctx = vm.createContext({esc});
  vm.runInContext(constant('PAYMENT_METHOD_ROWS') + fn('paymentLogoStripHtml') + ';this.strip = paymentLogoStripHtml();', ctx);
  const alts = [...ctx.strip.matchAll(/alt="([^"]+)"|aria-label="([^"]+)"/g)].map((m) => m[1] || m[2]);
  // Logos only: the bank emoji is on the FAQ's bank-transfer line, not in the rows (27/11/2026).
  assert.deepEqual(JSON.parse(JSON.stringify(alts)), ['Thai QR PromptPay', 'Visa', 'Mastercard', 'TrueMoney', 'ShopeePay', 'LINE Pay', 'Alipay', 'WeChat Pay', 'Wise']);
  assert.equal(ctx.strip.match(/<span class="pay-logo"/g).length, 9);
  assert.doesNotMatch(ctx.strip, /🏦/);
  assert.match(fn('applyI18n'), /renderSitePaymentLogos\(\);/);
  // A clear gap under the social icons on a phone.
  assert.match(source, /\.site-payments\{margin-top:10px;margin-bottom:6px;gap:10px\}/);
});

test('Balance on delivery shows the Thai QR mark ahead of Visa and Mastercard', () => {
  const ctx = vm.createContext({});
  vm.runInContext(qrConst + fn('paymentCardBadgesHtml') + fn('paymentEwalletBadgesHtml') + fn('paymentReservationBadgesHtml') + ';this.badges = paymentReservationBadgesHtml(); this.card = paymentCardBadgesHtml();', ctx);
  assert.match(ctx.badges, /^<span class="payment-brand-badges" aria-label="Thai QR PromptPay, Visa and Mastercard accepted"><img class="payment-card-logo payment-qr-logo" src="assets\/payment\/thai-qr-promptpay\.png" alt="Thai QR PromptPay"><img class="payment-card-logo" [^>]*alt="Visa">/);
  assert.doesNotMatch(ctx.card, /Thai QR/, 'Credit Card keeps Visa and Mastercard only');
  assert.match(fn('cashDeliveryOptionHtml'), /\$\{paymentReservationBadgesHtml\(\)\}/);
});

test('inside "pay the full amount" the options drop those words; the summary keeps them (TH/EN)', () => {
  for (const lang of ['th', 'en']) {
    const ctx = vm.createContext({state: {lang}, paymentRefundNoteHtml: () => '', paymentEwalletBadgesHtml: () => '', paymentThaiQrBadgeHtml: () => ''});
    vm.runInContext(qrConst + fn('paymentCardBadgesHtml') + fn('bankQrOptionHtml') + fn('creditOptionHtml') + fn('ewalletOptionHtml')
      + ';this.short = [bankQrOptionHtml(true), creditOptionHtml(true), ewalletOptionHtml(true)]; this.full = [bankQrOptionHtml(), creditOptionHtml(), ewalletOptionHtml()];', ctx);
    const titles = (list) => JSON.parse(JSON.stringify(list.map((html) => html.match(/<span class="payment-option-copy"><span>([^<]+)<\/span>/)[1])));
    assert.deepEqual(titles(ctx.short), lang === 'en' ? ['📱 QR PromptPay', '💳 Credit Card', '👛 E-Wallet'] : ['📱 QR PromptPay', '💳 บัตรเครดิต', '👛 E-Wallet']);
    assert.deepEqual(titles(ctx.full), lang === 'en'
      ? ['📱 QR PromptPay: pay full amount', '💳 Credit Card: pay full amount', '👛 E-Wallet: pay full amount']
      : ['📱 QR PromptPay: ชำระเต็มจำนวน', '💳 บัตรเครดิต: ชำระเต็มจำนวน', '👛 E-Wallet: ชำระเต็มจำนวน']);
  }
  const picker = fn('paymentPickerHtml');
  assert.match(picker, /option\("bank", bankQrOptionHtml\(true\)\)/);
  assert.match(picker, /option\("credit", creditOptionHtml\(true\)\),\n\s+option\("ewallet", ewalletOptionHtml\(true\)\)/);
  assert.match(fn('wiseOptionHtml'), /alt="Wise"><\/span>/, 'Wise is its logo alone');
  assert.match(fn('paymentOptionSummaryHtml'), /return ewalletOptionHtml\(\);/);
});

test('"ตรวจสอบข้อมูล" goes to the field: the right step, a red frame, the calendar for a date', () => {
  const target = fn('progressProblemTarget');
  const run = (calc, extra = {}) => {
    const ctx = vm.createContext({
      state: {calc, availability: {gate: {pass: extra.gate ?? true}}},
      byId: (id) => ({id}), UNIFIED_FLOW_DEMO: true,
      selectedDays: () => extra.days ?? 3, gameSelectionReady: () => extra.games ?? true,
      demoStep2Problems: () => extra.step2 || [], demoStep3Problems: () => extra.step3 || [],
    });
    vm.runInContext(target + ';this.t = progressProblemTarget;', ctx);
    return (step, field) => { const r = ctx.t(step, field); return {id: r.el?.id || null, calendar: r.calendar || ''}; };
  };
  assert.deepEqual(run({})(1), {id: 'calcConsole', calendar: ''}, 'no console: the console list');
  assert.deepEqual(run({consoleId: 'ps5'})(1), {id: 'startDate', calendar: 'start'}, 'no start date: the start date, calendar open');
  assert.deepEqual(run({consoleId: 'ps5', start: '2026-12-01'})(1), {id: 'endDate', calendar: 'end'});
  assert.deepEqual(run({consoleId: 'ps5', start: '2026-12-01', end: '2026-12-02'}, {days: 1})(1), {id: 'endDate', calendar: 'end'}, 'under 3 days: the return date');
  assert.deepEqual(run({consoleId: 'ps5', start: '2026-12-01', end: '2026-12-04'}, {gate: false})(1), {id: 'startDate', calendar: 'start'}, 'queue full: new dates');
  assert.deepEqual(run({consoleId: 'ps5', start: '2026-12-01', end: '2026-12-04'}, {games: false})(1), {id: 'demoGameCard', calendar: ''});
  assert.deepEqual(run({}, {step2: [{id: 'demoEmail'}]})(2), {id: 'demoEmail', calendar: ''});
  assert.deepEqual(run({}, {step3: [{id: 'demoSignaturePad'}]})(3), {id: 'demoSignatureBox', calendar: ''});
  assert.deepEqual(run({})(2, 'lineConnectBtn'), {id: 'lineConnectBtn', calendar: ''});
  assert.deepEqual(run({})(1, 'startDate'), {id: 'startDate', calendar: 'start'});

  const focus = fn('focusProgressProblem');
  assert.match(focus, /if\(focus\.step && focus\.step !== state\.calc\.step\) goCalcStep\(focus\.step, \{scrollTabs:true\}\);/);
  assert.match(focus, /el\.classList\.add\("attention-ring"\);/);
  assert.match(focus, /if\(target\.calendar\) window\.setTimeout\(\(\) => openCalendar\(target\.calendar\), 650\);/);
  assert.match(focus, /goCalcStep\(Number\(pane\.id\.slice\(4\)\), \{scrollTabs:true\}\);/, 'a field on another step opens that step');
  assert.match(fn('showDemoProgressProblem'), /progressProblemFocus = \{step, field\};/);
  assert.match(source, /if\(event\.target\.closest\("\[data-progress-problem-close\]"\)\)\{ closeModal\(\); focusProgressProblem\(\); return; \}/);
  assert.match(fn('showDeliveryQuoteProblem'), /progressProblemFocus = \{step:2, field:"demoMaps"\};/);
  // Every caller that knows its field passes it.
  assert.equal(source.match(/showDemoProgressProblem\(tr\("contactLineRequired"\), 2, \{field:"lineConnectBtn"\}\);/g).length, 4);
  assert.doesNotMatch(source, /showDemoProgressProblem\(tr\("contactLineRequired"\), 2\);/);
  assert.match(source, /showDemoProgressProblem\(problems\[0\]\.message, state\.calc\.step, \{field: problems\[0\]\.id\}\);/);
  assert.match(source, /state\.calc\.step, \{retryConfirm:true, field:"demoIdDocument"\}\);/);
  assert.match(source, /error\?\.code === "booking_hold_conflict" \? 1 : state\.calc\.step, \{field: error\?\.code === "booking_hold_conflict" \? "startDate" : ""\}\);/);
  assert.match(fn('demoAgreementProblem'), /has\("signatureDataUrl"\)\) return \{step:3, field:"demoSignaturePad"/);
  assert.match(source, /\.attention-ring\{outline:3px solid #d92d20!important;/);
});

test('a divider above "รีวิวจากลูกค้าจริง" and above "รีวิวจากลูกค้าและกิจกรรมที่ผ่านมา", like the one above the devices', () => {
  assert.match(source, /<section class="before-rent-mini-section has-divider" id="beforeRentReviewsSection" hidden>/);
  assert.match(source, /<section class="before-rent-mini-section has-divider" id="beforeRentHighlightsSection" hidden>/);
  assert.match(source, /\.before-rent-mini-section\.has-divider\{margin-top:22px;padding-top:20px;border-top:1px solid #e5e7eb\}/);
  assert.match(source, /\.before-rent-discovery\{margin-top:18px;padding-top:18px;border-top:1px solid #e5e7eb\}/);
});

test('the rental steps: "ทำรายการเช่า" step by step, and the payment line shows every way to pay (TH/EN)', () => {
  const guide = source.slice(source.indexOf('  const STEP_GUIDE = ['), source.indexOf('\n  ];\n', source.indexOf('  const STEP_GUIDE = [')));
  assert.match(guide, /<h4>ทำรายการเช่า<\/h4><ul><li>เลือกเครื่อง อุปกรณ์เสริมหรือ Bundle \(ถ้ามี\) วันเช่า และเกมที่ต้องการ<\/li><li>เชื่อมต่อและเพิ่มเพื่อน LINE ของร้าน เพื่อรับข้อมูลการเช่า<\/li><li>กรอกข้อมูลผู้เช่า: ชื่อ-นามสกุล เบอร์โทร อีเมล ที่อยู่จัดส่ง และบัญชีสำหรับรับคืนค่าประกัน \(ชาวต่างชาติใช้ Wise ได้\)<\/li><li>เลือกว่าจะยืนยันตัวตนหรือไม่ หากยืนยันตัวตน จะถ่ายรูปบัตรและเซ็นสัญญาในขั้นตอนถัดไป<\/li>/);
  assert.match(guide, /<h4>Make a booking<\/h4><ul><li>Choose the device, any accessories or bundle, the rental dates and your games\.<\/li><li>Send your booking to AJ on WhatsApp to receive your rental details \(LINE works too\)\.<\/li>/);
  assert.match(guide, /<li>ชำระเงินตามช่องทางที่เลือก__PAYMENT_LOGOS__<\/li>/);
  assert.match(guide, /<li>Pay with the method you chose\.__PAYMENT_LOGOS__<\/li>/);
  assert.doesNotMatch(guide, /หลังส่งข้อมูล|After submitting details|หลังทางร้านยืนยันคิวและค่าจัดส่ง|after the shop confirms availability/);
  // The owner's identity and agreement lines stay as they were.
  assert.match(guide, /<span class="step-mark">ผู้เช่าครั้งแรกต้องยืนยันตัวตนก่อนนัดส่งเครื่อง<\/span>/);
  assert.match(source, /\.replace\("__PAYMENT_LOGOS__",`<span class="pay-logos step-pay-logos" role="img" aria-label="\$\{esc\(tr\("sitePaymentsAccepted"\)\)\}">\$\{paymentLogoStripHtml\(\)\}<\/span>`\)/);
});

test('the games pill reads "รวม 10 เกม" / "Incl. 10 games" and is never cut to "…"', () => {
  assert.match(source, /beforeRentGamesIncluded:"รวม 10 เกม",/);
  assert.match(source, /beforeRentGamesIncluded:"Incl\. 10 games",/);
  assert.doesNotMatch(source, /\.before-rent-device-games-tag span\{[^}]*text-overflow:ellipsis/);
});

test('FAQ "อัปเดตรายการเกมได้ไหม?": yes, and what a list sent after hours does to the delivery (TH/EN)', () => {
  const ctx = vm.createContext({});
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'RESERVATION_FAQ', 'BALANCE_PAYMENT_FAQ', 'PAYMENT_METHODS_FAQ', 'CASH_FAQ', 'GAMES_UPDATE_FAQ', 'DEPOSIT_RETURN_QUESTION', 'NO_CONTRACT_FAQ', 'IDENTITY_HOW_FAQ', 'AGE_FAQ'].map(constant).join('\n')
    + constant('DEFAULT_FAQ') + fn('normalizeFaq') + ';this.normalizeFaq = normalizeFaq;', ctx);
  const list = ctx.normalizeFaq([
    {qTh: 'มีเกมติดตั้งมาในเครื่องเลยไหม', aTh: 'มี', qEn: 'Are games installed?', aEn: 'Yes'},
    {qTh: 'เลือกเกมเองได้ไหม', aTh: 'ได้', qEn: 'Can I choose my own games?', aEn: 'Yes'},
    {qTh: 'คืนค่าประกันเมื่อไหร่', aTh: 'x', qEn: 'When is the deposit returned?', aEn: 'x'},
    {qTh: 'อัปเดตรายการเกมได้ไหม', aTh: 'เก่า', qEn: 'Can I update my games?', aEn: 'old'},
  ]);
  const at = list.findIndex((f) => f.kind === 'games-update');
  assert.equal(list[at - 1].qTh, 'เลือกเกมเองได้ไหม', 'right after the last question about games');
  assert.equal(list.filter((f) => f.kind === 'games-update').length, 1, 'the saved copy is replaced, not repeated');
  const faq = list[at];
  assert.equal(faq.qTh, 'อัปเดตรายการเกมได้ไหม?');
  assert.match(faq.aTh, /^ได้ เปลี่ยนหรือเพิ่มเกมได้ก่อนเริ่มเช่า/);
  assert.match(faq.aTh, /หลังร้านปิด \(ตั้งแต่ 18:00 น\. ของคืนก่อนวันส่ง\) หรือในวันส่งก่อนร้านเปิด \(00:00–09:59 น\.\)/);
  assert.match(faq.aTh, /• ร้านจะติดตั้งเกมได้เมื่อร้านเปิด 10:00 น\. ใช้เวลาประมาณ 3 ชั่วโมง/);
  assert.match(faq.aTh, /• เวลาส่งที่นัดไว้ก่อน 13:00 น\. \(เช่น 10:00, 11:00, 12:00 น\.\) จะเปลี่ยนเป็น 13:00 น\./);
  assert.match(faq.aTh, /เลือกไม่รับเกมที่อัปเดตแล้วส่งเวลาเดิมพร้อมรายการเกมเดิม \(เลือกได้ถึง 10:00 น\. ของวันส่ง\)/);
  // 28/11/2026 (owner): not "no answer" but "did not say you skip the updated games".
  assert.match(faq.aTh, /• ถ้าไม่ได้แจ้งว่าไม่รับเกมที่อัปเดต ร้านจะส่งเครื่องตามเวลาใหม่พร้อมเกมที่อัปเดต/);
  assert.ok(!faq.aTh.includes('ไม่ตอบ'));
  assert.match(faq.aEn, /• If you do not tell us you are skipping the updated games, we deliver at the new time with them/);
  assert.ok(!/no answer/i.test(faq.aEn));
  assert.equal(faq.qEn, 'Can I update my game list?');
  assert.match(faq.aEn, /after the shop closes \(from 18:00 the evening before delivery\) or on the delivery day before it opens \(00:00–09:59\)/);
  assert.match(faq.aEn, /A delivery booked before 13:00 \(e\.g\. 10:00, 11:00, 12:00\) moves to 13:00/);
  assert.ok(!/[฀-๿]/.test(faq.aEn + faq.qEn), 'English has no Thai');
});

// 27/11/2026, owner: only the summary is left; no screenshot steps 1–7, no
// "Step n / 7", no back / next buttons (TH and EN).
test('how to rent: only the summary, without step numbers or back / next', () => {
  const guide = source.slice(source.indexOf('  const STEP_GUIDE = ['), source.indexOf('\n  ];\n', source.indexOf('  const STEP_GUIDE = [')));
  assert.equal((guide.match(/stepNo:/g) || []).length, 1);
  assert.doesNotMatch(source, /assets\/steps\//);
  assert.doesNotMatch(source, /Step \$\{step\.stepNo\}/);
  assert.doesNotMatch(source, /id="stepsNav"|id="stepsPrev"|id="stepsNext"|stepsIndex/);
  assert.doesNotMatch(source, /stepsPrev:|stepsNext:|stepsDone:/);
  const render = source.slice(source.indexOf('  function renderStepsBody(){'), source.indexOf('  // The rough-quote page in a pop-up'));
  assert.match(render, /const step = STEP_GUIDE\[0\];/);
  assert.match(render, /data-step-book/);
});
