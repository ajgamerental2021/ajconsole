import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const picker = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const start = picker.indexOf('function pickSendsList() {');
const end = picker.indexOf('function renderPickFooter() {', start);
assert.ok(start > -1 && end > start, 'picker action logic must be present');
const actions = picker.slice(start, end);

function actionAt(isoTime, { token = false, contractCard = false } = {}) {
  const calls = [];
  const instant = new Date(isoTime);
  const context = {
    Date: class extends Date { constructor() { super(instant); } },
    Intl,
    document: { body: { classList: { contains: value => value === 'aj-contract-card-picker' && contractCard } } },
    currentLang: 'en',
    isTokenGamePicker: () => token,
    showToast: message => calls.push(['closed', message]),
    sendContractCardGameList: () => calls.push(['send']),
    generateCopyText: () => calls.push(['booking']),
  };
  vm.runInNewContext(`${actions}\npickPrimaryAction();`, context);
  return calls;
}

test('booking picker remains usable overnight while post-booking selection and edits close', () => {
  const closed = '2026-10-06T14:00:00Z'; // 21:00 in Thailand
  assert.deepEqual(actionAt(closed), [['booking']]);
  assert.equal(actionAt(closed, { token: true })[0][0], 'closed');
  assert.equal(actionAt(closed, { contractCard: true })[0][0], 'closed');
  assert.equal(actionAt('2026-10-07T01:59:00Z', { token: true })[0][0], 'closed'); // 08:59
  assert.deepEqual(actionAt('2026-10-07T02:00:00Z', { token: true }), [['send']]); // 09:00
  assert.deepEqual(actionAt('2026-10-07T12:59:00Z', { token: true }), [['send']]); // 19:59
  assert.equal(actionAt('2026-10-07T13:00:00Z', { token: true })[0][0], 'closed'); // 20:00
});
