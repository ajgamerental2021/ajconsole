import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const logo = 'https://ajgamerental.com/assets/aj-share-logo.jpg';

test('the AJ logo is the picture on a shared link, for the site, the game IDs and the quote page', () => {
  assert.ok(existsSync(new URL('../assets/aj-share-logo.jpg', import.meta.url)));
  for (const page of ['index.html', 'ajgameid/index.html', 'quote/index.html']) {
    const html = read(page);
    assert.ok(html.includes(`property="og:image" content="${logo}"`), page);
    assert.ok(html.includes('property="og:title"'), page);
  }
});

test('the site is "เช่าเครื่องเกม", not "รายการเครื่อง"', () => {
  const html = read('index.html');
  assert.match(html, /<title>AJ Game Rental - เช่าเครื่องเกม<\/title>/);
  assert.match(html, /og:title" content="AJ Game Rental - เช่าเครื่องเกม"/);
  assert.doesNotMatch(html, /<title>AJ Game Rental - รายการเครื่อง/);
});

test('the game ID page describes itself', () => {
  const html = read('ajgameid/index.html');
  assert.match(html, /<meta name="description" content="รายการไอดีเกม PS5 ของ AJ เช่าเครื่องเกม/);
  assert.match(html, /og:title" content="รายการไอดีเกม PS5 · AJ เช่าเครื่องเกม"/);
});
