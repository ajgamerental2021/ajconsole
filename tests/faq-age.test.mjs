import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('under-20 rental FAQ is bilingual and normalized to the first position', () => {
  assert.match(html, /const AGE_FAQ = \{/);
  assert.match(html, /อายุไม่ถึง 20 ปีบริบูรณ์ เช่าได้ไหม\?/);
  assert.match(html, /ผู้ทำสัญญาต้องมีอายุ 20 ปีขึ้นไป/);
  assert.match(html, /Can I rent if I am under 20\?/);
  assert.match(html, /The person signing the rental agreement must be at least 20/);
  assert.match(html, /normalized\.unshift\(\{\.\.\.AGE_FAQ\}\)/);
});
