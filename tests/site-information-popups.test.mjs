import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('About, Privacy and Rental Terms are available from all required surfaces', () => {
  assert.equal((html.match(/ data-info-links/g) || []).length, 3);
  for (const page of ['about', 'privacy', 'terms']) {
    assert.match(html, new RegExp(`data-info-page="\\$\\{key\\}"`));
    assert.match(html, new RegExp(`${page}Title:`));
  }
});

test('information popup is bilingual and Terms uses the current server document', () => {
  assert.match(html, /เกี่ยวกับ AJ เช่าเครื่องเกม/);
  assert.match(html, /About AJ Game Rental/);
  assert.match(html, /นโยบายความเป็นส่วนตัว/);
  assert.match(html, /Privacy Policy/);
  assert.match(html, /new URL\("\/rental-terms\/", CONFIG\.apiBase\)/);
  assert.match(html, /url\.searchParams\.set\("embed", "1"\)/);
  assert.match(html, /id="infoModalLang"/);
});

test('privacy notice reflects the current identity-document retention policy', () => {
  assert.match(html, /ไม่เกิน 1 ปีนับจากวันคืนอุปกรณ์/);
  assert.match(html, /ไม่เกิน 1 ปีนับจากวันคืนอุปกรณ์/);
  assert.match(html, /no longer than one year from the return date/);
  assert.match(html, /no longer than one year from the return date/);
});
