import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Choosing games for a rental, not for today.
 *
 * A customer booking for next week was told a game releasing next Tuesday was
 * "not available", because the picker asked whether it was out today. What
 * matters is whether it arrives before the console goes back — and if it
 * arrives mid-rental the shop needs the submitted list to say so, because they
 * pack from that list and the customer cannot open the game on day one.
 */
const catalog = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');

/** The picker's own readiness functions, lifted out of the page and run. */
async function loadReadiness() {
  const start = catalog.indexOf('let pickerRentalStart =');
  const end = catalog.indexOf('function compareGamesForDisplay');
  assert.ok(start > 0 && end > start, 'the rental-window block should be in game_index.html');
  const dir = mkdtempSync(path.join(tmpdir(), 'aj-readiness-'));
  const file = path.join(dir, 'readiness.mjs');
  writeFileSync(file, catalog.slice(start, end)
    + '\nfunction ajTodayYmd(){return "2026-09-09";}\nlet currentLang="th";\n'
    + 'export function setLang(v){currentLang=v;}\n'
    + 'export {setPickerRentalRange,gameReadyAfterRentalStart,gameSelectionName,isGameUnavailable,normalizePickerDate};\n');
  return import(file);
}

const game = (date) => ({ name: 'Test Game', unavailable: true, available_date: date });

test('the rental window decides what may be chosen', async () => {
  const m = await loadReadiness();
  m.setPickerRentalRange('15/09/2026', '24/09/2026');

  assert.equal(m.isGameUnavailable(game('2026-09-04')), false, 'out before the rental starts');
  assert.equal(m.isGameUnavailable(game('2026-09-15')), false, 'out on day one');
  assert.equal(m.isGameUnavailable(game('2026-09-19')), false, 'out mid-rental');
  assert.equal(m.isGameUnavailable(game('2026-09-22')), false, 'out before it goes back');
  assert.equal(m.isGameUnavailable(game('2026-09-25')), true, 'out after it goes back');
  assert.equal(m.isGameUnavailable({ unavailable: true }), true, 'no date is no promise');
  assert.equal(m.isGameUnavailable({ name: 'ordinary' }), false);

  assert.equal(m.gameReadyAfterRentalStart(game('2026-09-04')), false, 'ready on day one needs no badge');
  assert.equal(m.gameReadyAfterRentalStart(game('2026-09-15')), false);
  assert.equal(m.gameReadyAfterRentalStart(game('2026-09-19')), true, 'arriving mid-rental must be badged');
  assert.equal(m.gameReadyAfterRentalStart(game('2026-09-25')), false, 'unselectable, so no badge');
});

test('the list sent to the shop carries the date the game becomes playable', async () => {
  const m = await loadReadiness();
  m.setPickerRentalRange('15/09/2026', '24/09/2026');

  assert.equal(m.gameSelectionName(game('2026-09-19')), 'Test Game (เล่นได้ 19/09/2026)');
  assert.equal(m.gameSelectionName(game('2026-09-22')), 'Test Game (เล่นได้ 22/09/2026)');
  m.setLang('en');
  assert.equal(m.gameSelectionName(game('2026-09-19')), 'Test Game (playable 19/09/2026)');

  assert.equal(m.gameSelectionName(game('2026-09-04')), 'Test Game', 'ready on day one is named plainly');
  assert.equal(m.gameSelectionName({ name: 'Plain' }), 'Plain');
});

test('the window is read in the format the Delivery App sends', async () => {
  const m = await loadReadiness();
  assert.equal(m.normalizePickerDate('15/09/2026'), '2026-09-15', 'the sheets keep dd/mm/yyyy');
  assert.equal(m.normalizePickerDate('5/9/2026'), '2026-09-05');
  assert.equal(m.normalizePickerDate('2026-09-15T00:00:00Z'), '2026-09-15');
  assert.equal(m.normalizePickerDate('next week'), '');

  m.setPickerRentalRange('15/09/2026', '24/09/2026');
  assert.equal(m.isGameUnavailable(game('2026-09-19')), false, 'a dd/mm/yyyy window must still open the game');
});

test('without both ends of the window the picker answers about today', async () => {
  const m = await loadReadiness();
  m.setPickerRentalRange('', '');
  assert.equal(m.isGameUnavailable(game('2026-09-10')), true);
  assert.equal(m.isGameUnavailable(game('2026-09-08')), false);

  // Half a window would have to guess the other half, and that guess decides
  // what a customer is allowed to choose.
  m.setPickerRentalRange('15/09/2026', '');
  assert.equal(m.isGameUnavailable(game('2026-09-19')), true);
});

test('every picker entry point learns the rental window', () => {
  assert.match(catalog, /selectionContext = data;[\s\S]{0,400}?setPickerRentalRange\(data\.startDate, data\.endDate \|\| data\.returnDate\)/);
  assert.match(catalog, /setPickerRentalRange\(request\.startDate, request\.endDate \|\| request\.returnDate\)/);
  assert.match(catalog, /เลือกได้ · เล่นได้ /);
  assert.match(catalog, /Selectable · Playable /);
  assert.match(catalog, /\.map\(id => gameSelectionName\(games\.find\(x => x\.id === id\)\)\)/);
});
