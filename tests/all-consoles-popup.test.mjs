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

test('type and brand filters start collapsed, show their selection, and expand on demand', () => {
  assert.match(source, /allConsolesFilterExpanded: \{type:false, brand:false\}/);
  assert.match(source, /data-all-console-filter-toggle="type"/);
  assert.match(source, /data-all-console-filter-toggle="brand"/);
  assert.match(source, /allConsolesSelected:"เลือกอยู่: \{value\}"/);
  assert.match(source, /allConsolesSelected:"Selected: \{value\}"/);
  assert.match(source, /state\.allConsolesFilterExpanded = \{type:false, brand:false\}/);
  assert.match(source, /state\.allConsolesFilterExpanded\[key\] = !state\.allConsolesFilterExpanded\[key\]/);
});

test('cards without a game-picker button omit the ten-game detail in both languages', () => {
  assert.match(source, /function isGameLimitDetail\(value\)/);
  assert.match(source, /เลือกเกมได้สูงสุด\\s\*10\\s\*เกม/);
  assert.match(source, /choose up to\\s\*10\\s\*games/);
  assert.match(source, /const gameButtonVisible = !!\(url && ready\)/);
  assert.match(source, /\.filter\(item => gameButtonVisible \|\| !isGameLimitDetail\(item\)\)/);
  assert.match(source, /\$\{gameButtonVisible \? `<button class="btn soft"/);
});
