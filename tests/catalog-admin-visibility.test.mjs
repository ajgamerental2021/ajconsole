import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const homeHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('game catalogue hides Admin unless admin=1 is present', () => {
  assert.match(gameHtml, /id="catalog-admin-btn"[^>]*hidden/);
  assert.match(gameHtml, /catalog-admin-btn'\)\.hidden = new URLSearchParams\(window\.location\.search\)\.get\('admin'\) !== '1'/);
});

test('game picker cache version is bumped after catalogue changes', () => {
  assert.match(homeHtml, /gamePickerVersion:\s*"20260920-1"/);
});

test('game catalogue retries through the uncached raw gist after an API failure', () => {
  assert.match(gameHtml, /\.catch\(function\(apiError\) \{[\s\S]*gist\.githubusercontent\.com\/ajgamerental2021\/' \+ gistId \+ '\/raw\/ajgame-data\.json\?_='/);
  assert.match(gameHtml, /fetch\(rawUrl, \{ cache: 'no-store' \}\)/);
});
