import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const fn = (name) => {
  const a = html.indexOf(`  function ${name}(`);
  return html.slice(a, html.indexOf('\n  }\n', a) + 4);
};
const ctx = { state: { lang: 'th' } };
vm.createContext(ctx);
vm.runInContext([fn('splitDetailLines'), fn('consoleServiceLine'), fn('consoleDetails')].join('\n'), ctx);
const details = (c, lang) => vm.runInContext(`consoleDetails(${JSON.stringify(c)}, ${JSON.stringify(lang)})`, ctx);

test('a saved literal "\\n" becomes separate boxes', () => {
  const c = { name: 'Meta Quest 3', detailsTh: ['2 จอย 🎮\\nสายครบ พร้อมเล่น ✅\\nเลือกเกมได้ 10 เกม 🔥'], detailsEn: ['2 controllers\\nAll cables'] };
  assert.deepEqual([...details(c, 'th')], ['2 จอย 🎮', 'สายครบ พร้อมเล่น ✅', 'เลือกเกมได้ 10 เกม 🔥']);
  assert.deepEqual([...details(c, 'en')], ['2 controllers', 'All cables']);
});

test('PS5, PS5 Pro and PS4 get PSN Plus; Xbox Series X and S get Game Pass; others nothing (TH/EN)', () => {
  for (const name of ['PS5', 'PS5 Pro', 'PS4']) {
    assert.equal(details({ name, detailsTh: ['2 จอย'] }, 'th').at(-1), 'รวม PSN Plus เล่นออนไลน์ได้ 🎮');
    assert.equal(details({ name, detailsEn: ['2 controllers'] }, 'en').at(-1), 'PSN Plus included, online play 🎮');
  }
  for (const name of ['Xbox Series X', 'Xbox Series S']) {
    assert.equal(details({ name, detailsTh: ['2 จอย'] }, 'th').at(-1), 'รวม Game Pass โหลดเกมเพิ่มเอง + เล่นออนไลน์ได้ 🎮');
    assert.match(details({ name, detailsEn: ['x'] }, 'en').at(-1), /^Game Pass included/);
  }
  for (const name of ['PS Portal', 'PS VR2', 'ROG Xbox Ally X', 'Nintendo Switch 2']) {
    assert.deepEqual([...details({ name, detailsTh: ['2 จอย'] }, 'th')], ['2 จอย'], name);
  }
});

test('not added twice when the shop already wrote it', () => {
  assert.deepEqual([...details({ name: 'PS5', detailsTh: ['รวม PSN Plus แล้ว'] }, 'th')], ['รวม PSN Plus แล้ว']);
});

test('admin edits real lines and every view uses consoleDetails', () => {
  assert.match(html, /\$\{esc\(c\.detailsTh\.join\("\\n"\)\)\}/);
  assert.doesNotMatch(html, /detailsTh\.join\("\\\\n"\)/);
  assert.match(html, /const details = consoleDetails\(c\)\.filter/);
  assert.equal((html.match(/consoleDetails\(/g) || []).length >= 5, true);
});
