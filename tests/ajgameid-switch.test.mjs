import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSwitchPage } from '../scripts/build-switch-id-page.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const ps5 = read('ajgameid/index.html');
const sw = read('ajgameid/switch/index.html');

test('the committed Switch page is what the build makes from the PS5 page', () => {
  // Run `node scripts/build-switch-id-page.mjs` after changing the PS5 page.
  assert.equal(sw, buildSwitchPage());
});

test('the Switch page is its own list: platform, Gist file, storage', () => {
  assert.match(sw, /const ID_PLATFORM = 'switch';/);
  assert.match(sw, /const DEFAULT_GIST_FILE = 'aj-switch-game-id-data\.json';/);
  assert.match(sw, /"storageKey":"aj_switch_game_id_rental_v1"/);
  assert.match(ps5, /const ID_PLATFORM = 'ps5';/);
  assert.match(ps5, /const DEFAULT_GIST_FILE = 'aj-ps5-game-id-data\.json';/);
});

test('a booking carries the list it came from, and each list reads only its own', () => {
  assert.match(ps5, /platform: ID_PLATFORM,\n\s+offerIndex/);
  assert.match(ps5, /url\.searchParams\.set\('platform', ID_PLATFORM\)/);
  assert.match(ps5, /row\.platform === ID_PLATFORM && !isConfirmedBooking\(row\)/);
});

test('a list with no Gist file yet keeps its own data instead of loading the other list', () => {
  assert.match(ps5, /const chosen = s\.filename\n\s+\? files\[s\.filename\]/);
  assert.doesNotMatch(ps5, /files\[s\.filename\] \|\| Object\.values\(files\)/);
});

test('the Switch page speaks Switch and resolves paths one folder deeper', () => {
  assert.match(sw, /<title>รายการไอดีเกม Nintendo Switch<\/title>/);
  assert.match(sw, /og:url" content="https:\/\/ajgamerental\.com\/ajgameid\/switch\/"/);
  assert.match(sw, /src="\.\.\/\.\.\/assets\/admin-passkey\.js"/);
  assert.match(sw, /\['\.\.\/assets\/help\/rent-step-1\.png'/);
  assert.doesNotMatch(sw, /aj-video\.mp4/);
  assert.match(sw, /Nintendo Account ของทางร้าน/);
  assert.match(sw, /Nintendo Switch Game ID List/);
});

test('both pages link to each other, the current one marked', () => {
  assert.match(ps5, /class="platform-tab active" data-platform="ps5" href="\/ajgameid\/" aria-current="page"/);
  assert.match(ps5, /class="platform-tab" data-platform="switch" href="\/ajgameid\/switch\/"/);
  assert.match(sw, /class="platform-tab" data-platform="ps5" href="\/ajgameid\/"/);
  assert.match(sw, /class="platform-tab active" data-platform="switch" href="\/ajgameid\/switch\/" aria-current="page"/);
});

test('the Switch starter data is one sample ID with a cover that exists', () => {
  const data = JSON.parse(read('ajgameid/switch/source_data.json'));
  assert.equal(data.ids.length, 1);
  assert.equal(data.ids[0].platform, 'Nintendo Switch');
  assert.ok(read(`ajgameid/switch/${data.ids[0].images[0]}`).includes('<svg'));
});
