import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const picker = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');

test('lists with pictures are patched in place, not rebuilt with innerHTML', () => {
  assert.match(page, /function patchHTML\(host, html\)/);
  assert.match(page, /patchHTML\(promoHost, /);
  assert.match(page, /patchHTML\(deviceHost, /);
  assert.match(page, /patchHTML\(reviewHost, /);
  assert.match(page, /patchHTML\(highlightsHost, /);
  for (const name of ['renderHome', 'renderConsoles', 'renderAllConsolesModal', 'renderDemoOrderPage']) {
    const a = page.indexOf(`  function ${name}(`);
    const body = page.slice(a, page.indexOf('\n  function ', a + 10));
    assert.doesNotMatch(body, /\bhost\.innerHTML = /, name);
    assert.match(body, /patchHTML\(host, /, name);
  }
  assert.match(page, /<article class="con-card \$\{ready\?"":"unavailable"\}" data-key=/);
  assert.match(page, /<div class="before-rent-device-wrap" data-key=/);
});

test('the rails keep one delegated listener and keep their scroll position on a data refresh', () => {
  assert.match(page, /function bindBeforeRentDiscoveryClicks\(promoHost, deviceHost\)/);
  assert.match(page, /if\(deviceHost && !deviceHost\.dataset\.clicksBound\)/);
  assert.doesNotMatch(page, /deviceHost\.querySelectorAll\("\[data-before-device\]"\)\.forEach/);
  assert.match(page, /if\(deviceHost\.dataset\.renderedType !== typeFilter\)/);
  assert.match(page, /if\(reviewsFirst\) reviewHost\.scrollLeft = 0;/);
  assert.match(page, /if\(highlightsFirst\) highlightsHost\.scrollLeft = 0;/);
});

test('the game picker patches its grid, so picking a game does not reload every cover', () => {
  assert.match(picker, /function patchHTML\(host, html\)/);
  const a = picker.indexOf('function renderPickBody() {');
  const body = picker.slice(a, picker.indexOf('/* ─── GENRE CHIP HELPER ─── */', a));
  assert.match(body, /patchHTML\(body, pg\.map\(g => \{/);
  assert.match(body, /patchHTML\(body, `<div class="game-list-view"/);
  assert.doesNotMatch(body, /body\.innerHTML = pg\.map/);
  assert.match(body, /onerror="pickImageFailed\(this\)"/);
  assert.match(picker, /const pickBrokenImages = new Set\(\);/);
});

test('opening the picker is applied once, without wiping the covers to the prompt', () => {
  assert.match(picker, /function isRepeatPickerOpen\(data\)/);
  assert.match(picker, /function openPickerFromParent\(data\)\{\n\s+if\(!isPicker\(\)\) return;\n\s+if\(isRepeatPickerOpen\(data\)\) return;/);
  assert.match(picker, /function forceRenderPicker\(request\)\{\n\s+ensureCatalogReady\(\);\n\s+if\(isRepeatPickerOpen\(request\)\) return;/);
  assert.match(picker, /function openPickModal\(options = \{\}\)/);
  assert.match(picker, /if \(!options\.platformPending\) \{/);
  assert.match(picker, /openPickModal\(\{ platformPending: !!bridgePlatformId \}\)/);
  assert.match(picker, /openPickModal\(\{ platformPending: !!pid \}\)/);
  assert.match(picker, /var lastPickerOpen = /);
  assert.match(page, /postMessage\(\{type:"AJ_PICKER_CLOSE"\}, pickerTargetOrigin\(\)\)/);
});

test('the full catalogue arriving refreshes an open picker in place and ticks late-known games', () => {
  assert.match(picker, /function refreshPickerAfterCatalog\(\)/);
  assert.match(picker, /if \(loadedFromGist\) refreshPickerAfterCatalog\(\);/);
  assert.match(picker, /rememberMissingPicks\(requestedIds, data\.selectedGameNames\);/);
  assert.match(picker, /rememberMissingPicks\(requestedIds, request\.selectedGameNames\);/);
  assert.match(picker, /lastPickerOpen\.missingNames/);
});
