import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// 27/11/2026, owner: a customer's 16-digit account could not be typed (the
// field stopped at 13). Up to 20 digits, the same limit as the Bot's checks.
test('the refund account field takes up to 20 digits', () => {
  assert.match(html, /id="demoRefundAccount" inputmode="numeric" autocomplete="off" maxlength="20"/);
  assert.match(html, /event\.target\.value\.replace\(\/\\D\/g, ""\)\.slice\(0, 20\)/);
  assert.equal((html.match(/\/\^\\d\{6,20\}\$\/\.test\(demoAgreement\.account\)/g) || []).length, 2);
  assert.doesNotMatch(html, /\\d\{6,13\}/);
  assert.doesNotMatch(html, /id="demoRefundAccount"[^>]*maxlength="13"/);
  const valid = /^\d{6,20}$/;
  assert.ok(valid.test('4162026283780923'));
  assert.ok(valid.test('1234567890'));
  assert.ok(!valid.test('1'.repeat(21)));
});
