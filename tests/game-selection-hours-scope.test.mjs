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
  assert.deepEqual(await actionAt('2026-10-06T14:59:00Z', { token: true }), [['send']]); // 21:59
  assert.equal((await actionAt('2026-10-06T15:00:00Z', { token: true }))[0][0], 'closed'); // 22:00
  assert.equal((await actionAt('2026-10-07T01:59:00Z', { token: true }))[0][0], 'closed'); // 08:59
  assert.deepEqual(await actionAt('2026-10-07T02:00:00Z', { token: true }), [['send']]); // 09:00
});
