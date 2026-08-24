const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const catalog = read('game_index.html');
const gameId = read('ajgameid/index.html');

for (const [name, html] of [['index', index], ['catalog', catalog], ['game ID', gameId]]) {
  assert.match(html, /<meta name="referrer" content="strict-origin-when-cross-origin"/i, `${name} needs a referrer policy`);
  assert.doesNotMatch(html, /ghp_[A-Za-z0-9]+/, `${name} must not embed a GitHub token`);
}

assert.doesNotMatch(catalog, /const\s+_a\s*=|const\s+_b\s*=/, 'catalog must not reconstruct admin credentials');
assert.doesNotMatch(gameId, /ADMIN_(?:USER|PASS)_HASH|crypto\.subtle\.digest/, 'game ID must not authenticate in the browser');
assert.doesNotMatch(catalog + gameId, /id="(?:gistToken|syncTokenInput)"/, 'admin token inputs must be removed');
assert.match(catalog, /\/api\/admin\/login/, 'catalog login must use the backend');
assert.match(gameId, /\/api\/admin\/login/, 'game ID login must use the backend');
assert.match(index + catalog + gameId, /\/api\/admin\/gists\//, 'Gist writes must use the authenticated backend proxy');

console.log('security baseline checks passed');
