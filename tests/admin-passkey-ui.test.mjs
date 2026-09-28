import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const index = await readFile(new URL('index.html', root), 'utf8');
const games = await readFile(new URL('game_index.html', root), 'utf8');
const ids = await readFile(new URL('ajgameid/index.html', root), 'utf8');
const helper = await readFile(new URL('assets/admin-passkey.js', root), 'utf8');

test('all three Admin surfaces offer passkey login and registration', () => {
  for (const source of [index, games, ids]) {
    assert.match(source, /simplewebauthn-browser-14\.0\.0\.umd\.min\.js/);
    assert.match(source, /admin-passkey\.js/);
    assert.match(source, /Passkey/);
    assert.match(source, /AJAdminPasskey\.login/);
    assert.match(source, /AJAdminPasskey\.register/);
  }
});

test('catalogue Admin credentials are no longer embedded in public HTML', () => {
  assert.doesNotMatch(games, /const _a = \[/);
  assert.doesNotMatch(games, /const _b = \[/);
  assert.doesNotMatch(ids, /ADMIN_USER_HASH/);
  assert.doesNotMatch(ids, /ADMIN_PASS_HASH/);
  assert.match(games, /\/api\/admin\/login/);
  assert.match(ids, /\/api\/admin\/login/);
  assert.doesNotMatch(games, /id="login-user"[^>]*placeholder="ajgame"/);
});

test('the shared helper binds ceremonies to the page origin and keeps bearer authorization on registration', () => {
  assert.match(helper, /origin: window\.location\.origin/);
  assert.match(helper, /\/api\/admin\/passkeys\/authentication\/options/);
  assert.match(helper, /\/api\/admin\/passkeys\/authentication\/verify/);
  assert.match(helper, /\/api\/admin\/passkeys\/registration\/options/);
  assert.match(helper, /Authorization: `Bearer \$\{adminToken\}`/);
});
