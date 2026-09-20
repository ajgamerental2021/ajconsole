import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the before-rent action opens a dedicated bilingual all-console popup', () => {
  assert.match(source, /beforeRentSeeAll:"ดูเครื่องเกมทั้งหมด"/);
  assert.match(source, /beforeRentSeeAll:"View all game consoles"/);
  assert.match(source, /id="allConsolesModal"[^>]*role="dialog"/);
  assert.match(source, /id="allConsolesLangBtn"/);
  assert.match(source, /deviceHost\.querySelector\("\[data-before-seeall\]"\)\?\.addEventListener\("click", \(\) => showAllConsoles\(\)\)/);
  assert.match(source, /function toggleAllConsolesLanguage\(\)/);
});

test('every popup console card has a device-specific availability and booking action', () => {
  assert.match(source, /renderConsoleGrid\(items, \{bookingButton:true\}\)/);
  assert.match(source, /data-all-console-book="\$\{esc\(String\(c\.id\)\)\}"/);
  assert.match(source, /allConsolesBook:"เช็คคิวและจอง"/);
  assert.match(source, /allConsolesBook:"Check availability & book"/);
  assert.match(source, /state\.calc\.type = selectedConsole\.type/);
  assert.match(source, /selectCalcConsole\(selectedConsole\.id\)/);
});

test('a standalone URL opens the all-console popup immediately', () => {
  assert.match(source, /pageParams\.get\("allConsoles"\) === "1"/);
  assert.match(source, /location\.hash === "#all-consoles"/);
  assert.match(source, /else if\(requestedAllConsoles\)\{[\s\S]*setTimeout\(showAllConsoles, 120\)/);
});

test('the popup uses compact cards and can copy its bilingual direct URL', () => {
  assert.match(source, /\.all-consoles-list \.console-grid\{grid-template-columns:repeat\(auto-fill,minmax\(205px,1fr\)\)/);
  assert.match(source, /\.all-consoles-list \.console-section\{padding:0;margin-top:20px\}/);
  assert.match(source, /id="allConsolesCopyUrl"/);
  assert.match(source, /allConsolesCopyUrl:"คัดลอก URL"/);
  assert.match(source, /allConsolesCopyUrl:"Copy URL"/);
  assert.match(source, /copySectionUrl\("allConsoles"\)/);
});
