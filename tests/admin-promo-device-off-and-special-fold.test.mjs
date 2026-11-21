import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const quote = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');

test('a model switched off in a rental promotion keeps its normal price, on the booking page and the quick quote', () => {
  assert.match(page, /keys\.some\(key => \(campaign\.excludedDeviceKeys \|\| \[\]\)\.includes\(key\)\)\) return \[\];/);
  assert.match(quote, /campaign\.excludedDeviceKeys\.indexOf\(key\) >= 0; \}\)\) return null;/);
});

test('the promotion form ticks every model it covers; unticked under "all devices" are saved as switched off', () => {
  assert.match(page, /const on=editing\.deviceKeys\.length \? editing\.deviceKeys\.includes\(key\) : !\(editing\.excludedDeviceKeys \|\| \[\]\)\.includes\(key\)/);
  assert.match(page, /const excludedDeviceKeys = scope === "all" \? unticked : \[\];/);
  assert.match(page, /ปิดโปร · ใช้ราคาปกติ/);
  assert.match(page, /Promotion off · normal price/);
  // Fixed prices per model are read from their own data attribute (they were saved under "undefined").
  assert.match(page, /input\.dataset\.promoDevicePrice,Number\(input\.value\)/);
});

test('special-rate campaigns fold, newest first; links sit above them and show the latest until unfolded', () => {
  assert.match(page, /<details class="card sp-campaign" data-sp-campaign="\$\{esc\(campaign\.id\)\}" \$\{adminSpecial\.open\.has\(campaign\.id\) \? "open" : ""\}>/);
  assert.match(page, /\}\)\.reverse\(\)\.join\(""\);/);
  assert.match(page, /adminSpecial\.linksOpen \? sortedLinks\.slice\(0, 60\) : sortedLinks\.slice\(0, 1\)/);
  assert.ok(page.indexOf('<div class="card sp-links">') < page.indexOf('${campaigns || `<div class="card"><p class="hint">${en ? "No campaigns yet."'), 'links card before the campaigns');
  assert.match(page, /adminSpecial\.open\.add\(id\);/);
});

test('special-rate admin: every button is wired; a held link shows its hold and can be released; a link into a full campaign warns', () => {
  const wired = page.match(/event\.target\.closest\("(#adminSpecial \[data-sp-[^"]+)"\)\)\{\n\s*void adminSpecialAction/)[1];
  for (const attr of ['data-sp-release', 'data-sp-links-toggle', 'data-sp-revoke', 'data-sp-link']) assert.ok(wired.includes(`[${attr}]`), attr);
  assert.match(page, /\$\{link\.holdUntil \? `<div class="hint">\$\{en \? "Unit held until" : "กันเครื่องถึง"\}/);
  assert.match(page, /\/api\/admin\/special-rates\/links\/\$\{encodeURIComponent\(release\.dataset\.spRelease\)\}\/release/);
  assert.match(page, /if\(result\.link\?\.campaignFull\)\{/);
});

test('a special-rate refusal at payment shows its own message only', () => {
  assert.match(page, /if\(error\?\.special\) return;\n      if\(String\(error\?\.code \|\| ""\)\.startsWith\("special_"\)\)\{ handleSpecialRefusal\(error\.code\); return; \}/);
  // A returning customer's leftover ticks are no discount at a special rate (21/11/2026).
  assert.match(page, /returningCustomer: !activeSpecial\(\) && !!state\.calc\.ret,/);
  assert.match(page, /reviewGoogle: !activeSpecial\(\) && !!state\.calc\.reviewGoogle,/);
});

test('at a special rate the returning-customer ticks are no change to the rental (Rental ID, WhatsApp, payment)', () => {
  assert.match(page, /!activeSpecial\(\) && state\.calc\.ret \? "ret" : "",/);
  assert.match(page, /index === 8 \|\| \(activeSpecial\(\) && index >= 9\) \|\| value === after\[index\]/);
  assert.match(page, /\.filter\(key => !\(activeSpecial\(\) && VERIFIED_ONLY_FIELDS\.includes\(key\)\)\)/);
});
