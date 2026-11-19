import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const marker = `  function ${name}(`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  }', start) + 4);
}
function constant(name) {
  const start = source.indexOf(`  const ${name} = {`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  };', start) + 5);
}

test('a question being typed survives the admin panel being redrawn', () => {
  const state = {faq: [{qTh: 'เดิม', aTh: 'ตอบ', qEn: 'Old', aEn: 'Answer'}, {qTh: '', aTh: '', qEn: '', aEn: ''}]};
  const inputs = [
    {dataset: {faq: '1:qTh'}, value: 'นำเครื่องไปต่างจังหวัดได้ไหม', readOnly: false},
    {dataset: {faq: '1:qEn'}, value: 'Can I travel', readOnly: false},
    {dataset: {faq: '0:aTh'}, value: 'ข้อความอัตโนมัติ', readOnly: true},
  ];
  const ctx = vm.createContext({state, byId: (id) => (id === 'adminFaq' ? {querySelector: () => inputs[0]} : null), $$: () => inputs});
  vm.runInContext('var faqDraftDirty = false;' + fn('readFaqDraftIntoState'), ctx);

  vm.runInContext('readFaqDraftIntoState()', ctx);
  assert.equal(state.faq[1].qTh, '', 'nothing is copied before anything was typed');

  ctx.faqDraftDirty = true;
  vm.runInContext('readFaqDraftIntoState()', ctx);
  assert.equal(state.faq[1].qTh, 'นำเครื่องไปต่างจังหวัดได้ไหม');
  assert.equal(state.faq[1].qEn, 'Can I travel');
  assert.equal(state.faq[0].aTh, 'ตอบ', 'a read-only generated answer is not copied over the saved one');
});

test('the panel redraw keeps drafts, and a sync does not overwrite them', () => {
  assert.match(fn('renderAdmin'), /readFaqDraftIntoState\(\);\n\s+byId\("adminBody"\)\.innerHTML/);
  assert.match(source, /if\(data\.faqData && !faqDraftDirty\) state\.faq = normalizeFaq\(data\.faqData\);/);
  assert.match(source, /if\(event\.target\.matches\?\.\("\[data-faq\]"\)\) faqDraftDirty = true;/);
  assert.match(source, /if\(delFaq\)\{ readFaqDraftIntoState\(\); state\.faq\.splice/);
  assert.match(fn('saveFaqFromAdmin'), /faqDraftDirty = false;/);
});

test('the travel question is always in the FAQ, in Thai and English, once', () => {
  const ctx = vm.createContext({});
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'RESERVATION_FAQ', 'BALANCE_PAYMENT_FAQ', 'DEPOSIT_RETURN_QUESTION', 'NO_CONTRACT_FAQ', 'IDENTITY_HOW_FAQ', 'AGE_FAQ'].map(constant).join('\n')
    + source.slice(source.indexOf('  const DEFAULT_FAQ = ['), source.indexOf('\n  ];', source.indexOf('  const DEFAULT_FAQ = [')) + 5)
    + fn('normalizeFaq') + ';this.normalizeFaq = normalizeFaq; this.TRAVEL_FAQ = TRAVEL_FAQ;', ctx);
  const stored = [
    {qTh: 'ถ้าเช่าแล้ว ขอยกเลิกหรือคืนเครื่องก่อนกำหนดได้ไหม', aTh: 'ได้', qEn: 'Can I cancel early?', aEn: 'Yes'},
    {qTh: 'เปลี่ยนวันเช่า จำนวนวัน หรือเพิ่มอุปกรณ์ได้ไหม', aTh: 'x', qEn: 'Can I change the rental dates or add accessories?', aEn: 'x'},
  ];
  const list = ctx.normalizeFaq(stored);
  const travel = list.filter((f) => f.kind === 'travel');
  assert.equal(travel.length, 1);
  assert.match(travel[0].aTh, /กรุงเทพฯ–ปริมณฑล หรือชลบุรี\/พัทยา/);
  assert.match(travel[0].aEn, /Bangkok and nearby provinces, or Chonburi\/Pattaya/);
  const changeAt = list.findIndex((f) => f.qEn.startsWith('Can I change the rental dates'));
  assert.equal(list.indexOf(travel[0]), changeAt + 1, 'placed right after the date-change question');
  assert.equal(ctx.normalizeFaq(list).filter((f) => f.kind === 'travel').length, 1, 'normalising again adds no second copy');
});

test('"ต้องโอนจองไหม" is rewritten and "ชำระส่วนที่เหลืออย่างไร" sits right under it (TH/EN)', () => {
  const ctx = vm.createContext({});
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'RESERVATION_FAQ', 'BALANCE_PAYMENT_FAQ', 'DEPOSIT_RETURN_QUESTION', 'NO_CONTRACT_FAQ', 'IDENTITY_HOW_FAQ', 'AGE_FAQ'].map(constant).join('\n')
    + source.slice(source.indexOf('  const DEFAULT_FAQ = ['), source.indexOf('\n  ];', source.indexOf('  const DEFAULT_FAQ = [')) + 5)
    + fn('normalizeFaq') + ';this.normalizeFaq = normalizeFaq;', ctx);
  const stored = [
    {qTh: 'ต้องโอนจองไหม ?', aTh: 'ค่าจองล็อกคิว: 200 บาท (โอนธนาคาร) หรือ 1,000 บาท (บัตร/E-Wallet ไม่มีค่าธรรมเนียม) ส่วนที่เหลือชำระตอนรับสินค้า หรือชำระเต็มล่วงหน้าได้ รองรับ โอนธนาคาร, บัตร +3.50%, E-Wallet +2.95% และ Wise', qEn: 'Do I need to pay a reservation?', aEn: 'old'},
    {qTh: 'ขั้นต่ำเช่ากี่วัน?', aTh: '3 วัน', qEn: 'Minimum?', aEn: '3 days'},
  ];
  const list = ctx.normalizeFaq(stored);
  const at = list.findIndex((f) => f.kind === 'reservation');
  assert.ok(at >= 0);
  assert.equal(list[at].aTh, 'ค่าจองล็อกคิว: 200 บาท (โอนธนาคาร) หรือ สำหรับต่างชาติ 1,000 บาท (บัตรเครดิต/E-Wallet ไม่มีค่าธรรมเนียม)');
  assert.match(list[at].aEn, /or for international customers ฿1,000 \(Credit Card\/E-Wallet, no fee\)/);
  assert.doesNotMatch(list[at].aTh, /ส่วนที่เหลือ|รองรับ/);
  const balance = list[at + 1];
  assert.equal(balance.kind, 'balance-payment');
  assert.equal(balance.qTh, 'ชำระส่วนที่เหลืออย่างไร?');
  assert.equal(balance.aTh, 'ส่วนที่เหลือชำระตอนรับสินค้า หรือชำระเต็มล่วงหน้าได้\n\nช่องทางที่รองรับ\n• โอนธนาคาร\n• QR PromptPay\n• บัตรเครดิต (+3.50%)\n• E-Wallet (+2.95%)\n• Wise\n\nQR PromptPay / บัตรเครดิต / E-Wallet จะส่ง Payment Link ให้ชำระเมื่อของถึงปลายทาง');
  assert.match(balance.aEn, /• Credit Card \(\+3\.50%\)/);
  assert.equal(ctx.normalizeFaq(list).filter((f) => f.kind === 'balance-payment').length, 1, 'normalising again adds no second copy');
});

test('"คืนค่าประกันเมื่อไหร่" becomes "คืนค่าประกันเมื่อไหร่และอย่างไร?" / "When and how is the deposit returned?", answer kept', () => {
  const ctx = vm.createContext({});
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'RESERVATION_FAQ', 'BALANCE_PAYMENT_FAQ', 'DEPOSIT_RETURN_QUESTION', 'NO_CONTRACT_FAQ', 'IDENTITY_HOW_FAQ', 'AGE_FAQ'].map(constant).join('\n')
    + source.slice(source.indexOf('  const DEFAULT_FAQ = ['), source.indexOf('\n  ];', source.indexOf('  const DEFAULT_FAQ = [')) + 5)
    + fn('normalizeFaq') + ';this.normalizeFaq = normalizeFaq;', ctx);
  const answerEn = 'Once all equipment is returned and inspected, the deposit will be refunded the same day via Thai bank transfer or Wise for international customers.';
  const list = ctx.normalizeFaq([{ qTh: 'คืนค่าประกันเมื่อไหร่?', aTh: 'คืนภายในวันเดียวกัน', qEn: 'When is the deposit returned?', aEn: answerEn }]);
  const deposit = list.filter((f) => /ประกัน/.test(f.qTh));
  assert.equal(deposit.length, 1);
  assert.equal(deposit[0].qTh, 'คืนค่าประกันเมื่อไหร่และอย่างไร?');
  assert.equal(deposit[0].qEn, 'When and how is the deposit returned?');
  assert.equal(deposit[0].aTh, 'คืนภายในวันเดียวกัน');
  assert.equal(deposit[0].aEn, answerEn);
  const again = ctx.normalizeFaq(list).filter((f) => /ประกัน/.test(f.qTh));
  assert.equal(again.length, 1);
  assert.equal(again[0].qEn, 'When and how is the deposit returned?', 'the new title stays as it is');
});

// 19/11/2026: "How do I verify my identity?" sits right above "Can I rent without
// identity verification?", with the identity step's own example photos: the Thai
// ID card on the Thai page, the passport on the English page.
test('"ยืนยันตัวตนยังไง?" is right above the no-identity question, once, TH/EN with example photos', () => {
  const ctx = vm.createContext({});
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'RESERVATION_FAQ', 'BALANCE_PAYMENT_FAQ', 'DEPOSIT_RETURN_QUESTION', 'NO_CONTRACT_FAQ', 'IDENTITY_HOW_FAQ', 'AGE_FAQ'].map(constant).join('\n')
    + source.slice(source.indexOf('  const DEFAULT_FAQ = ['), source.indexOf('\n  ];', source.indexOf('  const DEFAULT_FAQ = [')) + 5)
    + fn('normalizeFaq') + ';this.normalizeFaq = normalizeFaq;', ctx);
  const list = ctx.normalizeFaq([
    {qTh: 'ทำสัญญาการเช่าปลอดภัยไหม?', aTh: 'ปลอดภัย', qEn: 'Is the rental agreement safe?', aEn: 'Yes'},
    {qTh: 'เช่าโดยไม่ยืนยันตัวตนได้ไหม?', aTh: 'เก่า', qEn: 'Can I rent without identity verification?', aEn: 'old'},
    {qTh: 'ยืนยันตัวตนยังไง?', aTh: 'คำตอบเก่า', qEn: 'How do I verify my identity?', aEn: 'old answer'},
  ]);
  const how = list.findIndex((f) => f.kind === 'identity-how');
  const none = list.findIndex((f) => f.kind === 'noContractTerms');
  assert.equal(how, none - 1, 'right above');
  assert.equal(list.filter((f) => f.kind === 'identity-how' || /^ยืนยันตัวตนยังไง/.test(f.qTh)).length, 1, 'once, an older copy replaced');
  assert.match(list[how].aTh, /บัตรประชาชน/);
  assert.doesNotMatch(list[how].aTh, /Passport/i);
  assert.match(list[how].aEn, /passport/);
  assert.doesNotMatch(list[how].aEn, /ID card/);
  assert.equal(ctx.normalizeFaq(list).filter((f) => f.kind === 'identity-how').length, 1, 'normalising again adds no second copy');
  // The photos: the identity step's own, by language, each in its own popup with Close.
  assert.match(source, /id: \{file:"id-example-th\.png", button:"🖼️ ดูรูปตัวอย่าง: บัตรประชาชน"/);
  assert.match(source, /selfie: \{file:"selfie-example-th\.png", button:"🖼️ ดูรูปตัวอย่าง: เซลฟี่คู่บัตรประชาชน"/);
  assert.match(source, /id: \{file:"id-example-en\.png", button:"🖼️ Example: passport photo"/);
  assert.match(source, /selfie: \{file:"selfie-example-en\.png", button:"🖼️ Example: selfie with passport"/);
  assert.match(fn('showIdentityFaqExample'), /data-identity-example-close>\$\{en \? "Close" : "ปิด"\}<\/button>/);
  assert.equal((source.match(/: f\.kind === IDENTITY_HOW_FAQ\.kind \? identityFaqExampleButtons\(\)/g) || []).length, 2, 'on the page and in the FAQ popup');
});
