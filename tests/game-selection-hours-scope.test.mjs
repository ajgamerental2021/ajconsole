import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Games can be chosen or changed after booking at any hour (02/11/2026): the
// shop-hours window is gone. What a list sent before the shop opens does to
// today's delivery is asked about in a popup instead (confirmDeliveryChange).

const picker = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = picker.indexOf('function pickSendsList() {');
const end = picker.indexOf('function renderPickFooter() {', start);
assert.ok(start > -1 && end > start, 'picker action logic must be present');
const actions = picker.slice(start, end);

async function actionAt(isoTime, { token = false, contractCard = false } = {}) {
  const calls = [];
  const instant = new Date(isoTime);
  const context = {
    Date: class extends Date { constructor() { super(instant); } },
    Intl,
    document: {
      body: { classList: { contains: value => value === 'aj-contract-card-picker' && contractCard } },
      getElementById: () => null,
    },
    currentLang: 'en',
    pickSubmitState: 'idle',
    isTokenGamePicker: () => token,
    fetch: async () => { calls.push(['fetch']); return { ok: true, json: async () => ({}) }; },
    showToast: message => calls.push(['toast', message]),
    sendContractCardGameList: () => calls.push(['send']),
    generateCopyText: () => calls.push(['booking']),
  };
  await vm.runInNewContext(`${actions}\npickPrimaryAction();`, context);
  return calls;
}

test('after-booking links send at any hour, night included; checkout unchanged', async () => {
  for (const iso of [
    '2026-10-06T13:00:00Z', // 20:00
    '2026-10-06T16:00:00Z', // 23:00
    '2026-10-06T17:01:00Z', // 00:01
    '2026-10-07T01:59:00Z', // 08:59
    '2026-10-07T05:00:00Z', // 12:00
  ]) {
    assert.deepEqual(await actionAt(iso, { token: true }), [['send']], iso);
    assert.deepEqual(await actionAt(iso, { contractCard: true }), [['send']], iso);
    assert.deepEqual(await actionAt(iso), [['booking']], iso);
  }
});

function functionSource(name) {
  const begin = picker.indexOf(`function ${name}(`);
  const end = picker.indexOf('\n}', begin) + 2;
  assert.ok(begin >= 0 && end > begin, name);
  return picker.slice(begin, end);
}

test('after-booking picker can add, remove and clear games', () => {
  const context = vm.createContext({
    MAX_PICK: 10,
    pickSendsList: () => true,
    pickCapNotice: () => {},
    renderPickPlatformTabs: () => {},
    renderPickBody: () => {},
    renderPickFooter: () => {},
    syncPickModalScrollState: () => {},
    notifyPickChange: () => {},
    document: { getElementById: () => ({ classList: { remove: () => {} } }) },
  });
  vm.runInContext(`let pickedGames = ['A'];\n${functionSource('togglePick')}\n${functionSource('clearAllPicked')}`, context);
  vm.runInContext('togglePick("A")', context);
  assert.deepEqual([...vm.runInContext('pickedGames', context)], []);
  vm.runInContext('togglePick("B")', context);
  assert.deepEqual([...vm.runInContext('pickedGames', context)], ['B']);
  vm.runInContext('clearAllPicked()', context);
  assert.deepEqual([...vm.runInContext('pickedGames', context)], []);
});

test('send button is disabled only while sending or once saved', () => {
  const run = pickSubmitState => {
    const send = { style: {} };
    const context = vm.createContext({
      document: { getElementById: id => ({ 'btn-generate-copy': send, 'pick-primary-label': { textContent: '' } })[id] || null },
      isTokenGamePicker: () => true,
      pickSendsList: () => true,
      pickPrimaryLabel: () => 'Send',
      pickListChangedSinceSave: () => false,
      pickSubmitState,
    });
    vm.runInContext(`let pickedGames = ['A'];\n${functionSource('renderPickActions')}`, context);
    vm.runInContext('renderPickActions()', context);
    return send.disabled;
  };
  assert.equal(run('idle'), false);
  assert.equal(run('sending'), true);
  assert.equal(run('saved'), true);
});

test('saved games are ticked with the edit hint', () => {
  const notices = [];
  const context = vm.createContext({
    games: [{ id: 'A', name: 'Game A' }], MAX_PICK: 10,
    selectionContext: { selectedGames: ['Game A'] },
    matchSavedGameNames: () => ({ ids: ['A'], missing: [] }),
    renderPickPlatformTabs: () => {}, renderPickBody: () => {}, renderPickFooter: () => {},
    showToast: message => notices.push(message),
    pickSendsList: () => true,
    currentLang: 'th',
  });
  vm.runInContext(`let preselectionApplied = false; let pickedGames = []; let pickBaselineIds = [];\n${functionSource('applyPreselection')}`, context);
  vm.runInContext('applyPreselection()', context);
  assert.deepEqual([...vm.runInContext('pickedGames', context)], ['A']);
  assert.match(notices[0], /ติ๊กเกมที่เลือกไว้ให้แล้ว/);
});

test('no shop-hours window is left in the picker or the admin settings', () => {
  for (const name of ['gameUpdatesClosedNow', 'gameShopHoursMessage', 'loadGameUpdateHours', 'game-updates-closed', 'pick-shop-hours', '/api/game-update-hours']) {
    assert.ok(!picker.includes(name), `picker still has ${name}`);
  }
  for (const name of ['adminGameUpdateHoursHtml', 'saveGameUpdateHoursFromAdmin', '/api/admin/game-update-hours', 'loadGameUpdateHoursForAdmin']) {
    assert.ok(!admin.includes(name), `admin still has ${name}`);
  }
});
