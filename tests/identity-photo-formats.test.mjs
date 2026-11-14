import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// 15/11/2026: identity photos chosen from the phone are .jpg or .png only, and
// both uploads (booking step 3 and the "Verify now" pop-up, which share this
// grid) say so in Thai and English. A camera shot is still accepted.
const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('both identity uploads show the .jpg/.png rule and the picker accepts only those, TH/EN', () => {
  assert.equal((source.match(/<span class="demo-upload-format">\$\{esc\(tr\("identityFileFormats"\)\)\}<\/span>/g) || []).length, 2);
  assert.equal((source.match(/data-identity-file="(id|selfie)" type="file" accept="image\/jpeg,image\/png,\.jpg,\.jpeg,\.png"/g) || []).length, 2);
  assert.ok(source.includes('identityFileFormats:"📎 รองรับเฉพาะไฟล์รูป .jpg และ .png เท่านั้น"'));
  assert.ok(source.includes('identityFileFormats:"📎 JPG and PNG photos only (.jpg, .png)"'));
  assert.ok(source.includes('identityFileType:"ไฟล์นี้ใช้ไม่ได้ รองรับเฉพาะรูปนามสกุล .jpg และ .png (ไม่เกิน 40 MB) กรุณาเลือกรูปใหม่ หรือกดปุ่มถ่ายรูป"'));
  assert.ok(source.includes('identityFileType:"This file can’t be used. Only .jpg and .png photos are accepted (up to 40 MB). Choose another photo or use the camera button."'));
});

test('a chosen file must be .jpg or .png; a camera shot is still taken', () => {
  const body = source.match(/function demoIdentityFileAllowed\(file, fromCamera = false\)\{[\s\S]*?\n  \}/)[0];
  const allowed = new Function(`${body}; return demoIdentityFileAllowed;`)();
  const file = (name, type, size = 10) => ({name, type, size});
  assert.equal(allowed(file('a.jpg', 'image/jpeg')), true);
  assert.equal(allowed(file('a.png', 'image/png')), true);
  assert.equal(allowed(file('a.JPEG', '')), true);
  for (const [name, type] of [['a.webp', 'image/webp'], ['a.heic', 'image/heic'], ['a.pdf', 'application/pdf'], ['a.gif', 'image/gif']]) {
    assert.equal(allowed(file(name, type)), false, name);
  }
  assert.equal(allowed(file('a.jpg', 'image/jpeg', 41 * 1024 * 1024)), false);
  assert.equal(allowed(file('image.heic', 'image/heic'), true), true);
  assert.match(source, /if\(!demoIdentityFileAllowed\(file, true\)\)\{/, 'the camera input passes fromCamera');
});
