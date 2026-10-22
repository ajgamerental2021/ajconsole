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

test('editing on the payment-link page never asks for the refund account the page does not load', () => {
  const body = fn('demoStep2Problems');
  assert.match(body, /if\(!payResume\.active\) problems\.push\(\.\.\.demoRefundProblems\(\)\);/);
  assert.match(fn('renderDemoRefundSection'), /section\.hidden = payResume\.active;\n\s+if\(payResume\.active\)\{ section\.innerHTML = ""; return; \}/);
});

test('the name already on the rental passes on the payment-link page in either language', () => {
  const problems = (lang, fullName, active = true) => {
    const ctx = vm.createContext({
      state: {lang}, payResume: {active, rental: {customerName: 'สมชาย ใจดี'}},
      demoProfile: {fullName, phone: '0812345678', email: 'a@b.co', maps: 'https://maps.app.goo.gl/x', mapsText: '', termsAccepted: true, preferredContactChannel: ''},
      tr: (key) => key, activeLineConnection: () => null, bookingLineConnection: () => null, lineFriendExempt: () => true, lineFriendClicked: () => true,
      demoLegalNameValid: (name) => (lang === 'en' ? /^[A-Za-z .'-]+$/ : /^[฀-๿ .'-]+$/).test(name),
      demoPhoneValid: () => true, demoRefundProblems: () => [{id: 'demoRefundBank', message: 'bank'}],
      demoEmailValid: () => true, demoEmailMessage: () => '', validDemoMapsLink: () => true,
    });
    vm.runInContext(fn('demoStep2Problems') + ';this.run = demoStep2Problems;', ctx);
    return JSON.parse(JSON.stringify(ctx.run().map((p) => p.id)));
  };
  assert.deepEqual(problems('en', 'สมชาย ใจดี'), [], 'saved Thai name on an English page, no refund demanded');
  assert.deepEqual(problems('en', 'สมชาย ใจดีมาก'), ['demoCustomerName'], 'a changed name still follows the language rule');
  assert.ok(problems('th', 'สมชาย ใจดี', false).includes('demoRefundBank'), 'the booking flow still needs the refund account');
});

test('a failed pay or save names its cause in Thai and English', () => {
  const run = (lang, code, kind) => {
    const ctx = vm.createContext({state: {lang}});
    vm.runInContext(fn('payResumeProblemText') + ';this.text = payResumeProblemText;', ctx);
    return ctx.text(code, kind);
  };
  assert.match(run('th', 'payment_state_unavailable', 'pay'), /ตรวจสถานะการชำระเงิน/);
  assert.match(run('en', 'payment_state_unavailable', 'pay'), /payment status/);
  assert.match(run('th', 'booking_exists', 'pay'), /บันทึกการจองรายการนี้ไว้แล้ว/);
  assert.match(run('en', 'console_pending_not_found', 'save'), /still pay the saved amount/);
  assert.match(run('th', 'rental_update_failed', 'save'), /ข้อมูลเดิมยังอยู่/);
  assert.match(run('en', 'mystery', 'pay'), /could not be opened/);

  const code = (error) => {
    const ctx = vm.createContext({});
    vm.runInContext(fn('payResumeProblemCode') + ';this.code = payResumeProblemCode;', ctx);
    return ctx.code(vm.runInContext(error, ctx));
  };
  assert.equal(code("Object.assign(new Error('x'), {code: 'booking_exists'})"), 'booking_exists');
  assert.equal(code("new Error('queue_check_failed')"), 'queue_check_failed');
  assert.equal(code("new TypeError('Failed to fetch')"), 'network');
  assert.equal(code("new TypeError('Cannot read properties of undefined')"), 'page_error');
  assert.equal(code("new Error('Something odd happened')"), 'unknown');
});

test('pay and save failures open the cause pop-up instead of a generic toast', () => {
  const launch = source.slice(source.indexOf('  async function launchPayResume('), source.indexOf('  async function notifyDemoLine('));
  assert.match(launch, /showPayResumeProblem\(error, "pay"\);/);
  assert.doesNotMatch(launch, /เปิดหน้าชำระเงินไม่สำเร็จ กรุณาลองใหม่/);
  assert.match(fn('showPayResumeProblem'), /trackAnalytics\("client_error", \{errorCode:`pay_resume_\$\{kind\}_failed`/);
  const save = source.slice(source.indexOf('  async function savePayResumeChanges('), source.indexOf('  async function savePayResumeEditModal('));
  assert.match(save, /showPayResumeProblem\(error, "save"\);/);
});

test('the locked-editing notice says nothing is missing, and the order page cannot throw on a missing device', () => {
  assert.match(source, /ข้อมูลของคุณครบถ้วนแล้ว ไม่มีอะไรต้องกรอกเพิ่ม กดชำระเงินยอดด้านล่างได้ตามปกติ/);
  assert.match(source, /Your details are complete — nothing is missing\./);
  assert.match(fn('renderDemoOrderPage'), /if\(!item\)\{ patchHTML\(host, ""\); return; \}/);
});
