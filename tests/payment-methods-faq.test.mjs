import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import vm from 'node:vm';

// 26/11/2026: the FAQ lists every way to pay with its logo and says cash is not
// taken; the full Thai QR payment is named "QR PromptPay" with its mark; and the
// "โปรโมชั่น" heading goes when every promotion is switched off in admin.

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

function faqContext() {
  const ctx = vm.createContext({});
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'RESERVATION_FAQ', 'BALANCE_PAYMENT_FAQ', 'PAYMENT_METHODS_FAQ', 'CASH_FAQ', 'DEPOSIT_RETURN_QUESTION', 'NO_CONTRACT_FAQ', 'IDENTITY_HOW_FAQ', 'AGE_FAQ'].map(constant).join('\n')
    + constant('DEFAULT_FAQ') + fn('normalizeFaq') + ';this.normalizeFaq = normalizeFaq;', ctx);
  return ctx;
}

test('the saved "ชำระค่าจองหรือค่าเช่าอย่างไร" becomes the payment-methods answer, with "no cash" right under it', () => {
  const ctx = faqContext();
  const list = ctx.normalizeFaq([
    {qTh: 'ค่าจัดส่งคิดอย่างไร ?', aTh: 'ตามจริง', qEn: 'Delivery fee?', aEn: 'Actual'},
    {qTh: 'ชำระค่าจองหรือค่าเช่าอย่างไร', aTh: 'สามารถดูตัวเลือกการชำระเงินในขั้นตอนคำนวณค่าเช่า รองรับเงินโอน บัตรเครดิต และ E-Wallet', qEn: 'How do I pay for the rental?', aEn: 'old'},
    {qTh: 'ต้องโอนจองไหม?', aTh: 'x', qEn: 'Do I need to pay to reserve?', aEn: 'x'},
  ]);
  const at = list.findIndex((f) => f.kind === 'payment-methods');
  assert.equal(list[at - 1].qTh, 'ค่าจัดส่งคิดอย่างไร ?', 'kept where the shop put it');
  assert.equal(list[at].aTh, 'เลือกช่องทางชำระได้ในขั้นตอนคำนวณค่าเช่า แล้วชำระตามที่ระบบแจ้ง\n\nช่องทางการชำระเงินที่รองรับ');
  assert.equal(list[at].qEn, 'How do I pay the reservation or the rental?');
  assert.equal(list[at + 1].kind, 'cash');
  assert.equal(list[at + 1].qTh, 'รับชำระด้วยเงินสดไหม?');
  assert.match(list[at + 1].aTh, /^ทางร้านไม่รับชำระด้วยเงินสด รวมถึงการฝากเงินสดไว้กับคนขับ/);
  assert.equal(list[at + 1].qEn, 'Do you accept cash?');
  assert.match(list[at + 1].aEn, /^No\. We don't accept cash, including cash handed to the driver\./);
  assert.equal(list[at + 2].kind, 'reservation');
  const again = ctx.normalizeFaq(list);
  assert.equal(again.filter((f) => f.kind === 'payment-methods').length, 1);
  assert.equal(again.filter((f) => f.kind === 'cash').length, 1, 'normalising again adds no second copy');
});

test('with no saved payment question, both go in just before "ต้องโอนจองไหม?"', () => {
  const list = faqContext().normalizeFaq([
    {qTh: 'ขั้นต่ำเช่ากี่วัน?', aTh: '3 วัน', qEn: 'Minimum?', aEn: '3 days'},
    {qTh: 'ต้องโอนจองไหม?', aTh: 'x', qEn: 'Do I need to pay to reserve?', aEn: 'x'},
    {qTh: 'รับเงินสดไหม', aTh: 'รับ', qEn: 'Do you take cash?', aEn: 'Yes'},
  ]);
  const at = list.findIndex((f) => f.kind === 'payment-methods');
  assert.deepEqual(list.slice(at, at + 3).map((f) => f.kind), ['payment-methods', 'cash', 'reservation']);
  assert.equal(list.filter((f) => f.kind === 'cash').length, 1, 'an old cash answer is replaced, not repeated');
  assert.ok(!list.some((f) => f.aTh === 'รับ'));
});

test('one line per method, name and fee, every logo in the same-size tile (TH/EN)', () => {
  const ctx = vm.createContext({esc});
  vm.runInContext(constant('PAYMENT_METHOD_ROWS') + fn('paymentMethodsFaqHtml') + ';this.html = paymentMethodsFaqHtml;', ctx);
  for (const lang of ['th', 'en']) {
    const html = ctx.html(lang);
    const rows = html.match(/<li class="faq-pay-method">/g) || [];
    assert.equal(rows.length, 5, lang);
    const names = [...html.matchAll(/<span class="faq-pay-name"><b>([^<]+)<\/b><small>([^<]+)<\/small>/g)].map((m) => `${m[1]} | ${m[2]}`);
    assert.deepEqual(names, lang === 'en'
      ? ['QR PromptPay | No fee', 'Thai bank transfer | No fee', 'Credit Card | + 3.50% fee', 'E-Wallet | + 2.95% fee', 'Wise | For international customers']
      : ['QR PromptPay | ไม่มีค่าธรรมเนียม', 'โอนเข้าบัญชีธนาคาร | ไม่มีค่าธรรมเนียม', 'บัตรเครดิต | + ค่าธรรมเนียม 3.50%', 'E-Wallet | + ค่าธรรมเนียม 2.95%', 'Wise | สำหรับลูกค้าต่างชาติ']);
    const tiles = html.match(/<span class="faq-pay-logo"/g) || [];
    assert.equal(tiles.length, 10, 'QR, bank, Visa, Mastercard, five wallets, Wise');
    assert.match(html, /<span class="faq-pay-logo"><img src="assets\/payment\/thai-qr-promptpay\.png" alt="Thai QR PromptPay"/);
    assert.match(html, /alt="Visa".*alt="Mastercard".*alt="TrueMoney".*alt="ShopeePay".*alt="LINE Pay".*alt="Alipay".*alt="WeChat Pay".*alt="Wise"/s);
  }
  assert.ok(existsSync(new URL('../assets/payment/thai-qr-promptpay.png', import.meta.url)), 'the Thai QR mark ships with the site');
  assert.match(source, /\.faq-pay-logo\{display:inline-flex;align-items:center;justify-content:center;width:52px;height:30px;/);
  // The FAQ section and the FAQ popup draw the same answer.
  assert.equal(source.match(/\$\{faqAnswerHtml\(f, answer\)\}/g)?.length, 2);
});

test('the full Thai QR payment reads "QR PromptPay" with its mark, both languages, everywhere it is named', () => {
  for (const lang of ['th', 'en']) {
    const ctx = vm.createContext({state: {lang}});
    vm.runInContext(fn('paymentThaiQrBadgeHtml') + fn('bankQrOptionHtml') + ';this.option = bankQrOptionHtml;', ctx);
    const html = ctx.option();
    assert.match(html, lang === 'en' ? /📱 QR PromptPay: pay full amount<\/span><small>No fee<\/small>/ : /📱 QR PromptPay: ชำระเต็มจำนวน<\/span><small>ไม่มีค่าธรรมเนียม<\/small>/);
    assert.match(html, /<img class="payment-card-logo payment-qr-logo" src="assets\/payment\/thai-qr-promptpay\.png" alt="Thai QR PromptPay">/);
  }
  assert.match(fn('paymentPickerHtml'), /option\("bank", bankQrOptionHtml\(\)\)/);
  assert.match(fn('paymentOptionSummaryHtml'), /if\(state\.calc\.payment === "bank"\) return `\$\{label\} \$\{paymentThaiQrBadgeHtml\(\)\}`;/);
  assert.doesNotMatch(source, /Thai Bank Transfer|โอนผ่านบัญชีธนาคารไทย/);
});

test('every promotion switched off hides the "โปรโมชั่น" heading instead of a stand-in card', () => {
  assert.match(source, /<section class="before-rent-mini-section" id="beforeRentPromosSection" hidden>/);
  const render = fn('renderBeforeRentDiscovery');
  assert.match(render, /if\(promosSection\) promosSection\.hidden = promos\.length === 0;/);
  assert.doesNotMatch(render, /data-before-start/, 'no "จองคิวเช่า" card in place of the promotions');
  assert.match(render, /if\(!section \|\| section\.enabled === false\) return;/);
});
