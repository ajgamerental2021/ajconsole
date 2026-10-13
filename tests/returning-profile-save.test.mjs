import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = page.indexOf('function validDemoMapsLink(value){');
const end = page.indexOf('\n  function showReturningSaveProblem', start);
assert.ok(start > 0 && end > start);
const valid = Function(`${page.slice(start, end)}; return validDemoMapsLink;`)();

test('Step 2 accepts map links that the profile API can store', () => {
  for (const link of [
    'https://maps.app.goo.gl/abc123',
    'https://maps.google.com/?q=13.8,100.6',
    'https://www.google.com/maps/place/Bangkok',
    'https://google.com/maps/search/?api=1&query=Bangkok',
    'https://www.google.co.th/maps/place/Bangkok',
    'https://maps.apple.com/?ll=13.8,100.6',
  ]) assert.equal(valid(link), true, link);
  for (const link of [
    'https://example.com/maps/place/Bangkok',
    'https://www.google.com.evil.test/maps',
    'http://maps.google.com/?q=13.8,100.6',
    'https://www.google.com/search?q=Bangkok',
    'https://maps.app.goo.gl/',
    `https://maps.app.goo.gl/${'a'.repeat(501)}`,
  ]) assert.equal(valid(link), false, link);
});

test('a failed save offers a same-page fix, retry or renewed verification in both languages', () => {
  for (const text of ['แก้ไขช่องนี้', 'Edit this field', 'ลองบันทึกอีกครั้ง', 'Try saving again', 'ยืนยันสิทธิ์อีกครั้ง', 'Verify again']) {
    assert.ok(page.includes(text), text);
  }
  assert.match(page, /data-returning-save-retry/);
  assert.match(page, /data-returning-save-edit/);
  assert.match(page, /data-returning-save-verify/);
});
