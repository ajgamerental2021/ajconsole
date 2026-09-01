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
  assert.match(booking, /gamePickerVersion: "20260901-1"/);
});
