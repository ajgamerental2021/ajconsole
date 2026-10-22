import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalog = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const booking = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('game order ID is editable, unique, persisted, and bilingual', () => {
  assert.match(catalog, /id="gf-order" type="number" min="1"/);
  assert.match(catalog, /function normalizeGameOrders\(items\)/);
  assert.match(catalog, /g\.orderId=orderId/);
  assert.match(catalog, /orderId, platformId:savePlatformId/);
  assert.match(catalog, /ลำดับ ID \(แก้ไขได้\)/);
  assert.match(catalog, /ID order \(editable\)/);
  assert.match(catalog, /order_duplicate: 'This ID order is already in use/);
});

test('new games default to the front of the ready group and shift occupied IDs', () => {
  assert.match(catalog, /document\.getElementById\('gf-order'\)\.value = g \? g\.orderId : 1/);
  assert.match(catalog, /if \(Number\.isInteger\(existingOrder\) && existingOrder >= orderId\) game\.orderId = existingOrder \+ 1/);
  assert.match(catalog, /if \(id && games\.some\(game => Number\(game\.orderId\) === orderId && game\.id !== id\)\)/);
  assert.match(catalog, /return g && g\.insertedAt && g\.autoFront !== false \? Number\(g\.insertedAt\) \|\| 0 : 0;/);
  assert.match(catalog, /insertedAt: Date\.now\(\), autoFront:true/);
  assert.match(catalog, /g\.autoFront=false/);
});

test('not-ready checkbox immediately reveals and requires the ready date', () => {
  assert.match(catalog, /function toggleUnavailableDate\(\)/);
  assert.match(catalog, /dateRow\.style\.display = unavailable \? 'block' : 'none'/);
  assert.match(catalog, /dateInput\.required = unavailable/);
});

test('not-ready games always lead by farthest ready date on every game surface', () => {
  assert.match(catalog, /if \(aUnavailable !== bUnavailable\) return aUnavailable \? -1 : 1/);
  assert.match(catalog, /String\(b\.available_date \|\| ''\)\.localeCompare\(String\(a\.available_date \|\| ''\)\)/);
  assert.match(catalog, /sortGamesForDisplay\(games\.filter\(g => gameMatchesPlatform\(g, adminGameFilter\)\), 'manual'\)/);
  assert.match(catalog, /pg = sortGamesForDisplay\(pg, sortMode\)/);
  assert.match(catalog, /pg = sortGamesForDisplay\(pg, pickSortMode\)/);
  assert.match(catalog, /platformSortMode\[p\.id\] \|\| 'manual'/);
  assert.match(catalog, /let pickSortMode = 'manual'/);
});

test('not-ready games require a date in Thai and English', () => {
  assert.match(catalog, /if \(unavailable && !available_date\)/);
  assert.match(catalog, /กรุณาเลือกวันที่พร้อมให้บริการ/);
  assert.match(catalog, /Select the ready-for-service date/);
});

test('booking page cache-buster points clients to the new picker version', () => {
  assert.match(booking, /gamePickerVersion: "20261022-1"/);
});

import vm from 'node:vm';
function fn(name) {
  const start = catalog.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return catalog.slice(start, catalog.indexOf('\n}\n', start) + 3);
}
function sorter(today) {
  const ctx = vm.createContext({ ajTodayYmd: () => today, Date, Number, String, Array });
  vm.runInContext('let pickerRentalStart = ""; let pickerRentalEnd = "";'
    + ['normalizePickerDate', 'hasLiveRentalWindow', 'gameReadyDuringRental', 'isGameUnavailable', 'readyGroupSince',
      'compareGamesForDisplay', 'sortGamesForDisplay'].map(fn).join('\n')
    + ';this.sort = (items) => sortGamesForDisplay(items, "manual").map(g => g.name);', ctx);
  return ctx.sort;
}

test('a game reaching its ready date moves to the front of the ready group, behind the games still waiting', () => {
  const games = [
    { name: 'Fire Emblem', orderId: 1 },
    { name: 'Moonlighter 2', orderId: 2 },
    { name: 'Zelda remake', orderId: 3, unavailable: true, available_date: '2026-11-05' },
    { name: 'Switch Sports Resort', orderId: 17, unavailable: true, available_date: '2026-10-22' },
  ];
  assert.deepEqual(sorter('2026-10-21')(games), ['Zelda remake', 'Switch Sports Resort', 'Fire Emblem', 'Moonlighter 2'],
    'the day before, both wait (farthest date first)');
  assert.deepEqual(sorter('2026-10-22')(games).slice(1, 3), ['Switch Sports Resort', 'Fire Emblem'],
    'on its date it is no longer waiting, and leads the ready games');
  assert.deepEqual(sorter('2026-10-22')(games), ['Zelda remake', 'Switch Sports Resort', 'Fire Emblem', 'Moonlighter 2'],
    'on its date it leads the ready games, after the one still waiting');
});

test('newest arrival leads: a game ready today beats one added earlier, and one added later beats it', () => {
  const day = Date.parse('2026-10-22T00:00:00+07:00');
  const games = [
    { name: 'Old manual', orderId: 1 },
    { name: 'Added yesterday', orderId: 2, insertedAt: day - 3600_000, autoFront: true },
    { name: 'Ready today', orderId: 30, unavailable: true, available_date: '2026-10-22' },
    { name: 'Added this afternoon', orderId: 4, insertedAt: day + 14 * 3600_000, autoFront: true },
    { name: 'Edited new game', orderId: 5, insertedAt: day + 15 * 3600_000, autoFront: false },
  ];
  assert.deepEqual(sorter('2026-10-22')(games), ['Added this afternoon', 'Ready today', 'Added yesterday', 'Old manual', 'Edited new game']);
});
