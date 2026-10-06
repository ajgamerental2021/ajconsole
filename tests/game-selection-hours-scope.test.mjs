import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const picker = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const start = picker.indexOf('function pickSendsList() {');
const end = picker.indexOf('function renderPickFooter() {', start);
assert.ok(start > -1 && end > start, 'picker action logic must be present');
const actions = picker.slice(start, end);

async function actionAt(isoTime, { token = false, contractCard = false, settings } = {}) {
  const calls = [];
  const instant = new Date(isoTime);
  const context = {
    Date: class extends Date { constructor() { super(instant); } },
    Intl,
    AbortController,
    setTimeout,
    clearTimeout,
    document: {
      body: { classList: { contains: value => value === 'aj-contract-card-picker' && contractCard } },
      getElementById: () => null,
    },
    currentLang: 'en',
    pickSubmitState: 'idle',
    isTokenGamePicker: () => token,
    fetch: async () => ({ ok: true, json: async () => ({ settings }) }),
    showToast: message => calls.push(['closed', message]),
    sendContractCardGameList: () => calls.push(['send']),
    generateCopyText: () => calls.push(['booking']),
  };
  await vm.runInNewContext(`${actions}\npickPrimaryAction();`, context);
  return calls;
}

test('checkout picker works at night; after-booking links use editable Bangkok hours', async () => {
  const late = '2026-10-06T16:00:00Z'; // 23:00 in Thailand
  assert.deepEqual(await actionAt(late), [['booking']]);
  assert.equal((await actionAt(late, { token: true }))[0][0], 'closed');
  assert.equal((await actionAt(late, { contractCard: true }))[0][0], 'closed');
  assert.deepEqual(await actionAt(late, { token: true, settings: {enabled:false,startTime:'09:00',endTime:'22:00'} }), [['send']]);
  assert.deepEqual(await actionAt(late, { token: true, settings: {enabled:true,startTime:'09:00',endTime:'23:30'} }), [['send']]);
  assert.deepEqual(await actionAt('2026-10-06T12:59:00Z', { token: true }), [['send']]); // 19:59
  assert.equal((await actionAt('2026-10-06T13:00:00Z', { token: true }))[0][0], 'closed'); // 20:00
  assert.equal((await actionAt('2026-10-07T01:59:00Z', { token: true }))[0][0], 'closed'); // 08:59
  assert.deepEqual(await actionAt('2026-10-07T02:00:00Z', { token: true }), [['send']]); // 09:00
});

function functionSource(name) {
  const begin = picker.indexOf(`function ${name}(`);
  const end = picker.indexOf('\n}', begin) + 2;
  assert.ok(begin >= 0 && end > begin, name);
  return picker.slice(begin, end);
}

test('after-booking picker cannot add, remove or clear games while closed; checkout still can', () => {
  const run = sendsList => {
    const context = vm.createContext({
      MAX_PICK: 10,
      pickSendsList: () => sendsList,
      gameUpdatesClosedNow: () => true,
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
    const afterRemove = vm.runInContext('pickedGames.slice()', context);
    vm.runInContext('togglePick("B")', context);
    const afterAdd = vm.runInContext('pickedGames.slice()', context);
    vm.runInContext('clearAllPicked()', context);
    const afterClear = vm.runInContext('pickedGames.slice()', context);
    return { afterRemove: [...afterRemove], afterAdd: [...afterAdd], afterClear: [...afterClear] };
  };
  assert.deepEqual(run(true), { afterRemove: ['A'], afterAdd: ['A'], afterClear: ['A'] });
  assert.deepEqual(run(false), { afterRemove: [], afterAdd: ['B'], afterClear: [] });
});

test('closed after-booking picker disables send, clear, copy, and selected remove buttons', () => {
  const makeRun = sendsList => {
    const buttons = { send: { style: {} }, clear: {}, copy: {}, remove: {} };
    let closedClass = false;
    const notice = { style: {}, textContent: '' };
    const context = vm.createContext({
      document: {
        body: { classList: { toggle: (_, value) => { closedClass = value; } } },
        getElementById: id => ({ 'btn-generate-copy': buttons.send, 'btn-copy-final': buttons.copy,
          'pick-shop-hours': notice, 'pick-primary-label': { textContent: '' } })[id] || null,
        querySelector: () => buttons.clear,
        querySelectorAll: () => [buttons.remove],
      },
      isTokenGamePicker: () => false,
      pickSendsList: () => sendsList,
      gameUpdatesClosedNow: () => true,
      gameShopHoursMessage: () => '09:00–20:00',
      pickPrimaryLabel: () => 'Send',
      pickSubmitState: 'idle',
    });
    vm.runInContext(`let pickedGames = ['A'];\n${functionSource('renderPickActions')}`, context);
    vm.runInContext('renderPickActions()', context);
    return { disabled: Object.values(buttons).map(button => button.disabled), closedClass, notice: notice.textContent };
  };
  assert.deepEqual(makeRun(true), { disabled: [true, true, true, true], closedClass: true, notice: '09:00–20:00' });
  assert.deepEqual(makeRun(false), { disabled: [false, false, false, false], closedClass: false, notice: '' });
});
