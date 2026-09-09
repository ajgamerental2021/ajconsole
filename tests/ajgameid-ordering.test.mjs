import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../ajgameid/index.html', import.meta.url), 'utf8');

test('embedded ajgameid keeps editable manual IDs', () => {
  assert.match(html, /id="fIdNo" type="number" min="1"\s*\/>/);
  assert.match(html, /labelIdNo: 'ลำดับ ID \(แก้ไขได้\)'/);
  assert.match(html, /labelIdNo: 'ID order \(editable\)'/);
  assert.match(html, /function preserveItemIds\(items\)/);
  assert.doesNotMatch(html, /function normalizeSequentialIds\(items\)/);
  assert.match(html, /const duplicate = state\.some/);
});

test('embedded ajgameid puts unavailable games first, then new items by creation date', () => {
  assert.match(html, /if \(aNotReady !== bNotReady\) return aNotReady \? -1 : 1/);
  assert.match(html, /readyDateSortValue\(b\)\.localeCompare\(readyDateSortValue\(a\)\)/);
  assert.match(html, /createdAt: new Date\(\)\.toISOString\(\)/);
  assert.match(html, /itemCreatedAtSortValue\(b\) - itemCreatedAtSortValue\(a\)/);
  assert.match(html, /Number\(item\?\.idNo\) === 67/);
  assert.match(html, /Number\(item\?\.idNo\) === 68/);
  assert.match(html, /return \(Number\(a\?\.idNo\)[\s\S]*?- \(Number\(b\?\.idNo\)/);
});

test('embedded ajgameid requires an availability date in both languages', () => {
  assert.match(html, /draft\.notReady && !draft\.readyDate/);
  assert.match(html, /กรุณาเลือกวันที่พร้อมให้บริการ/);
  assert.match(html, /Please select the ready-for-service date/);
});
