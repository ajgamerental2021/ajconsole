import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../ajgameid/index.html', import.meta.url), 'utf8');

test('embedded ajgameid keeps editable manual IDs', () => {
  assert.match(html, /id="fIdNo" type="number" min="1"\s*\/>/);
  assert.match(html, /labelIdNo: 'ลำดับ ID \(แก้ไขได้\)'/);
  assert.match(html, /labelIdNo: 'ID order \(editable\)'/);
  assert.match(html, /function preserveItemIds\(items\)/);
  assert.doesNotMatch(html, /function normalizeSequentialIds\(items\)/);
  assert.match(html, /const duplicate = state\.some/);
});

test('embedded ajgameid puts unavailable games first, then available items by display date', () => {
  assert.match(html, /if \(aNotReady !== bNotReady\) return aNotReady \? -1 : 1/);
  assert.match(html, /readyDateSortValue\(b\)\.localeCompare\(readyDateSortValue\(a\)\)/);
  assert.match(html, /createdAt: new Date\(\)\.toISOString\(\)/);
  assert.match(html, /itemDisplaySortValue\(b\) - itemDisplaySortValue\(a\)/);
  assert.match(html, /Number\(item\?\.idNo\) === 67/);
  assert.match(html, /Number\(item\?\.idNo\) === 68/);
  assert.match(html, /return \(Number\(a\?\.idNo\)[\s\S]*?- \(Number\(b\?\.idNo\)/);
});

test('a newly released ID 73 precedes older ID 72, while future IDs precede the release', () => {
  assert.match(html, /function isReleasedFromNotReady\(item\)/);
  const source = html.slice(html.indexOf('    function readyDateSortValue(item) {'), html.indexOf('    function ddmmyyyy(date) {'));
  const context = { todayInBangkok: () => new Date(Date.UTC(2026, 9, 15, 12)) };
  vm.runInNewContext(`${source}\nthis.sort = sortItems;`, context);
  const ids = [
    { idNo: 72, createdAt: '2026-09-15T05:07:21.181Z', notReady: false, readyDate: '' },
    { idNo: 73, createdAt: '2026-10-14T15:34:24.542Z', notReady: false, readyDate: '2026-10-15' },
    { idNo: 66, notReady: false, readyDate: '2026-09-24' },
    { idNo: 74, createdAt: '2026-10-16T00:00:00.000Z', notReady: false, readyDate: '' },
    { idNo: 75, createdAt: '2026-10-14T00:00:00.000Z', notReady: true, readyDate: '2026-10-20' },
  ];
  assert.deepEqual(Array.from(context.sort(ids), item => item.idNo), [75, 74, 73, 66, 72]);
});

test('IDs 70, 8 and 71 are grouped immediately before ID 69', () => {
  assert.match(html, /function placeFeaturedIdsBeforeIdSixtyNine\(items\)/);
  assert.match(html, /const featuredIds = \[70, 8, 71\]/);
  assert.match(html, /Number\(item\?\.idNo\) === idNo/);
  assert.match(html, /Number\(item\?\.idNo\) === 69/);
  assert.match(html, /withoutFeatured\.splice\(targetIndex, 0, \.\.\.featured\)/);
  assert.match(html, /return placeFeaturedIdsBeforeIdSixtyNine\(sorted\)/);
});

test('embedded ajgameid requires an availability date in both languages', () => {
  assert.match(html, /draft\.notReady && !draft\.readyDate/);
  assert.match(html, /กรุณาเลือกวันที่พร้อมให้บริการ/);
  assert.match(html, /Please select the ready-for-service date/);
});
