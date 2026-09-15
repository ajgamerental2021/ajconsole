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

test('released games stay after the new-game group and preserve ready-date order', () => {
  assert.match(html, /function isReleasedFromNotReady\(item\)/);
  assert.match(html, /const aReleased = isReleasedFromNotReady\(a\)/);
  assert.match(html, /if \(aReleased !== bReleased\) return aReleased \? -1 : 1/);
  assert.match(html, /if \(aReleased && bReleased\)/);
  assert.match(html, /readyDateSortValue\(a\)\.localeCompare\(readyDateSortValue\(b\)\)/);
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
