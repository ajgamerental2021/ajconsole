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
  assert.match(homeHtml, /gamePickerVersion:\s*"20260901-2"/);
});
