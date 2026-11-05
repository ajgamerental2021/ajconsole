import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('a failed LINE handoff start restores an actionable button and shows an inline error', async () => {
  const source = html.slice(
    html.indexOf('  let lineConnectLaunchPromise = null;'),
    html.indexOf('  async function completeLineConnectionHandoff(){')
  );
  const button = {
    attributes: new Map(),
    setAttribute(key, value) { this.attributes.set(key, value); },
    removeAttribute(key) { this.attributes.delete(key); },
    textContent: '', innerHTML: '',
  };
  let rendered = 0;
  const alerts = [];
  const context = {
    lineConnectErrorKey: '',
    ensureLineConnectHandoff: async () => { throw new Error('line_handoff_start_failed'); },
    byId: id => id === 'demoCustomerCard' ? { querySelector: () => null } : button,
    tr: key => key,
    contactBrandIcon: () => '<svg></svg>', esc: value => value,
    render: () => { rendered++; }, toast: value => { alerts.push(value); },
    console: { warn() {} },
  };
  // The pop-up's "OK, connect LINE" runs startLineConnect; the failure path is there.
  vm.runInNewContext(`${source}\nthis.run = () => startLineConnect(false); this.error = () => lineConnectErrorKey;`, context);
  context.run();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.error(), 'contactLineStartFailed');
  assert.equal(rendered, 1);
  assert.deepEqual(alerts, ['contactLineStartFailed']);
  assert.equal(button.attributes.has('aria-busy'), false);
  assert.match(button.innerHTML, /contactLineConnect/);
});

test('both LINE buttons open the Allow pop-up first; its OK starts the connect, Cancel does nothing', async () => {
  const source = html.slice(html.indexOf('  let lineConnectLaunchPromise = null;'), html.indexOf('  async function completeLineConnectionHandoff(){'));
  const listeners = {};
  let shown = null, closed = 0, started = 0;
  const context = {
    showModal: (title, body) => { shown = { title, body }; },
    closeModal: () => { closed++; },
    byId: id => ({ addEventListener: (_type, fn) => { listeners[id] = fn; }, setAttribute() {}, removeAttribute() {}, querySelector: () => null }),
    tr: key => key, esc: value => value, contactBrandIcon: () => '',
    ensureLineConnectHandoff: async () => { started++; throw new Error('line_handoff_stop'); },
    render() {}, toast() {}, console: { warn() {} },
  };
  vm.runInNewContext(`${source}\nthis.run = connectLine;`, context);
  context.run({ preventDefault() {}, target: { closest: selector => selector === '#lineConnectFallback' ? {} : null } });
  assert.equal(shown.title, 'contactLinePopupTitle');
  assert.match(shown.body, /contactLinePopupBody/);
  assert.equal(started, 0, 'nothing starts before the customer agrees');
  listeners.lineConnectPopupCancel();
  assert.equal(started, 0);
  listeners.lineConnectPopupGo();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(started, 1, 'OK starts the LINE connect');
});

test('an expired LINE handoff tells the customer instead of stopping silently', async () => {
  const source = html.slice(
    html.indexOf('  async function pollLineConnectHandoff(){'),
    html.indexOf('  function lineBookingSelection(){')
  );
  let rendered = 0;
  const alerts = [];
  const context = {
    lineConnectErrorKey: '', lineConnectPollTimer: 0, lineConnectPollInFlight: false,
    pendingLineConnectHandoff: () => null,
    clearTimeout() {}, render: () => { rendered++; },
    toast: value => { alerts.push(value); }, tr: key => key,
  };
  vm.runInNewContext(`${source}\nthis.run = pollLineConnectHandoff; this.error = () => lineConnectErrorKey;`, context);
  await context.run();
  assert.equal(context.error(), 'contactLineExpired');
  assert.equal(rendered, 1);
  assert.deepEqual(alerts, ['contactLineExpired']);
});
