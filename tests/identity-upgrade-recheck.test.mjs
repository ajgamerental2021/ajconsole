import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const submit = html.slice(html.indexOf('async function submitIdentityUpgrade(token)'), html.indexOf('function verifyNowProblemFor(error)'));
const problems = html.slice(html.indexOf('function verifyNowProblemFor(error)'), html.indexOf('async function submitVerifyNowByContext()'));

test('verify-now asks whether the upgrade landed before calling a lost answer a failure', () => {
  assert.match(submit, /async function identityUpgradeLanded\(token\)/);
  assert.match(submit, /catch\{\s*\/\/[^\n]*\n[^\n]*\n\s*if\(await identityUpgradeLanded\(token\)\) return \{ok:true, already:true\};/);
  assert.match(submit, /\(response\.status >= 500 \|\| result\.error === "upgrade_in_progress"\) && await identityUpgradeLanded\(token\)/);
  assert.match(submit, /latest\.state === "done"/);
});

test('storage, save and server failures are named to the renter, in Thai and English', () => {
  for (const code of ['identity_storage_unavailable', 'booking_save_failed', 'identity_images_invalid']) assert.match(problems, new RegExp(code));
  assert.match(problems, /ระบบเก็บรูปขัดข้องชั่วคราว/);
  assert.match(problems, /AJ's photo storage is briefly unavailable/);
});
