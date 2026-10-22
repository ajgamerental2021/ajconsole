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
  vm.runInContext(['RENTAL_CHANGE_FAQ', 'TRAVEL_FAQ', 'DELIVERY_FAQS', 'DELIVERY_PROCESS_FAQ', 'NO_CONTRACT_FAQ', 'AGE_FAQ'].map(constant).join('\n')
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
