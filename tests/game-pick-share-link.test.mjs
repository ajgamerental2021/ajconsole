import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const site = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const picker = fs.readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');

test('the copy button says what it does, in both languages', () => {
  assert.match(site, /copyGameUrl:"คัดลอกลิงก์"/);
  assert.match(site, /copyGameUrl:"Copy link"/);
  assert.doesNotMatch(site, /\.game-picker-copy-url span\{display:none\}/);
});

test('Copy link makes a new private shared list each time and saves every tap to it', () => {
  assert.match(site, /byId\("gamePickerCopyUrl"\)\.addEventListener\("click", \(\) => \{ void copyGamePickLink\(\); \}\)/);
  assert.match(site, /method:"POST",[\s\S]{0,120}body:JSON\.stringify\(\{selections:nonEmptyPicks\(\)\}\)/);
  assert.match(site, /data\.type === "AJ_PICKER_CHANGED"[\s\S]{0,400}saveGamePickChange\(platformId, data\.change\)/);
  assert.match(site, /method:"PATCH"/);
  assert.match(site, /url\.searchParams\.set\("pick", sessionId\)/);
  assert.match(site, /openSharedGamePicks\(sharedPickId, requestedConsole\)/);
});

test('every sync string exists in Thai and English', () => {
  for (const key of ['gamePickLinkCopied', 'gamePickLinkCopiedText', 'gamePickLinkOk', 'gamePickLinkFailed', 'gamePickLinkExpired', 'gamePickSaveFailed', 'gamePickConsoleFull', 'gamePickerMoreConsoles', 'gamePickerFewerConsoles']) {
    assert.equal((site.match(new RegExp(`\\b${key}:"`, 'g')) || []).length, 2, key);
  }
});

test('the picker reports each tap and takes a friend\'s changes back', () => {
  assert.match(picker, /function notifyPickChange\(change\)/);
  assert.match(picker, /notifyPickChange\(\{ gameId, selected \}\);/);
  assert.match(picker, /notifyPickChange\(\{ clear: true \}\);/);
  assert.match(picker, /post\('AJ_PICKER_CHANGED'/);
  assert.match(picker, /data\.type === 'AJ_PICKER_SET_SELECTION'[\s\S]{0,160}applyPickedFromHost\(data\.gameIds\)/);
});

test('a copied link is explained in a popup closed with "รับทราบ", not a bar over the games', () => {
  assert.match(site, /id="gamePickLinkModal"/);
  assert.match(site, /gamePickLinkOk:"รับทราบ"/);
  assert.match(site, /gamePickLinkOk:"Got it"/);
  assert.match(site, /showGamePickLinkPopup\("done"\);\n\s*startGamePickPolling\(\);/);
  assert.doesNotMatch(site, /id="gamePickerSync"/);
});

test('the folded console row stays on one line with "More" beside the consoles', () => {
  assert.match(site, /host\.classList\.toggle\("is-folded", !state\.gamePickerPlatformsOpen\)/);
  assert.match(site, /\.game-picker-platforms\.is-folded\{flex-wrap:nowrap/);
  assert.match(site, /\.game-picker-platforms\.is-folded \.game-picker-platform-more\{position:sticky;right:0/);
});

test('Copy link opens a busy popup at once, and only its finished state can be closed', () => {
  assert.match(site, /gamePickLinkBusy:"กำลังสร้างลิงก์และคัดลอก…"/);
  assert.match(site, /gamePickLinkBusy:"Creating and copying the link…"/);
  assert.equal((site.match(/\bgamePickLinkBusyText:"/g) || []).length, 2);
  assert.match(site, /showGamePickLinkPopup\("busy"\);\n\s*try\{\n\s*const link = await copyTextFrom\(createGamePickLink\(\)\);/);
  assert.match(site, /showGamePickLinkPopup\("done"\);/);
  assert.match(site, /if\(modal\.dataset\.state === "busy"\) return;/);
  assert.match(site, /\.game-pick-link-modal\[data-state="busy"\] #gamePickLinkOk\{display:none\}/);
  assert.match(site, /signal:AbortSignal\.timeout\(GAME_PICK_CREATE_TIMEOUT_MS\)/);
});
