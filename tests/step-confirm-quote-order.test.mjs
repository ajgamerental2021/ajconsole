import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.search(new RegExp(`\\n  (?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} exists`);
  const from = start + 1;
  return source.slice(from, source.indexOf('\n  }\n', from) + 4);
}

function checkout({ lang, noContract, failFirstContext = false, failQuote = false }) {
  const calls = [];
  const messages = [];
  const demoDelivery = { status: 'idle', quote: null, key: '', error: '' };
  const state = { lang, calc: { noContract, step: noContract ? 2 : 3, maps: '' } };
  const demoProfile = { maps: 'https://maps.example/pin', preferredContactChannel: 'email',
    identitySkipped: false, identityUploaded: false, idDocument: {}, selfieWithId: {} };
  let contexts = 0;
  const context = vm.createContext({
    state, demoDelivery, demoProfile, UNIFIED_FLOW_DEMO: true, console: { error() {} },
    stepReady: () => true, showDemoBusy() {}, hideDemoBusy() {},
    bookingLineConnection: () => ({ token: 'verified-line' }),
    demoAgreementNeeded: () => !noContract, ensureIdentityDraftAlive: async () => true,
    demoDeliveryQuoteKey: () => 'same-pin-and-dates', DELIVERY_QUOTE_FRESH_MS: 28 * 60 * 1000, renderDeliveryQuoteViews() {},
    fetchDemoDeliveryQuote: async () => {
      calls.push('quote');
      demoDelivery.status = failQuote ? 'unavailable' : 'ready';
      demoDelivery.key = 'same-pin-and-dates';
      demoDelivery.quotedAt = Date.now();
      demoDelivery.quote = failQuote ? null : { subtotal: 500, total: 400, outbound: { quotationId: `q-${calls.length}` } };
    },
    calcSummary: () => ({ total: 3400 }),
    ensureRentalCode: async () => { calls.push('allocate'); return 'AJ-20261014-RTEST'; },
    rememberRental() {},
    prepareContractHandoff: async () => {
      calls.push('context');
      assert.equal(demoDelivery.status, 'ready');
      assert.ok(demoDelivery.quote.outbound.quotationId);
      if(failFirstContext && contexts++ === 0) throw Object.assign(new Error('delivery_quote_required'), { code: 'delivery_quote_required' });
      return { contextToken: 'ctx', message: 'safe test', data: {} };
    },
    queueConsolePendingUpsert: async () => {}, uploadDemoIdentity: async () => { calls.push('identity'); },
    submitDemoAgreement: async () => { calls.push('agreement'); },
    demoIdentityStatus: () => 'submitted', saveLocal() {}, render() {}, scrollToDemoOrderTop() {},
    maybeSendPayLaterEmail() {}, showDemoProgressProblem: (message, step) => messages.push({ message, step }),
    showDeliveryQuoteProblem: (retry) => messages.push({ deliveryQuote: true, retry }),
    confirmDemoOrder: async () => {},
    showDemoAgreementProblem: () => { throw new Error('unexpected agreement error'); },
    showQueueRetryDialog: () => { throw new Error('unexpected queue error'); },
    trackAnalytics() {},
  });
  vm.runInContext([fn('confirmedDemoDeliveryQuote'), fn('ensureDemoDeliveryQuote'), fn('openDemoOrder')].join('\n'), context);
  return { run: () => context.openDemoOrder(), calls, messages, state };
}

for(const lang of ['th', 'en']) for(const noContract of [true, false]) {
  test(`${lang}: ${noContract ? 'no identity' : 'identity now'} quotes before creating a booking`, async () => {
    const flow = checkout({ lang, noContract });
    await flow.run();
    assert.deepEqual(flow.calls.slice(0, 3), ['quote', 'allocate', 'context']);
    assert.equal(flow.state.calc.demoOrderOpen, true);
    assert.deepEqual(flow.messages, []);
    assert.equal(flow.calls.includes('identity'), !noContract);
    assert.equal(flow.calls.includes('agreement'), true);
  });
}

test('a forgotten server quote is refreshed and retried with the same rental code', async () => {
  const flow = checkout({ lang: 'en', noContract: true, failFirstContext: true });
  await flow.run();
  assert.deepEqual(flow.calls.slice(0, 5), ['quote', 'allocate', 'context', 'quote', 'context']);
  assert.equal(flow.state.calc.demoOrderOpen, true);
});

for(const lang of ['th', 'en']) {
  test(`${lang}: an unavailable quote explains the block and never submits a rental`, async () => {
    const flow = checkout({ lang, noContract: true, failQuote: true });
    await flow.run();
    assert.deepEqual(flow.calls, ['quote']);
    assert.equal(flow.state.calc.demoOrderOpen, undefined);
    // The delivery-fee dialog: check again (retrying the same confirm) or contact AJ.
    assert.equal(flow.messages[0].deliveryQuote, true);
    assert.equal(typeof flow.messages[0].retry, 'function');
  });
}

test('the Bot quote refusal remains a typed error for automatic recovery', async () => {
  const context = vm.createContext({
    UNIFIED_FLOW_DEMO: true, state: { calc: { demoContextToken: '' } }, console,
    bookingLineConnection: () => null,
    CONFIG: { contractWebUrl: 'https://bot.example/liff/', contractUrl: 'https://liff.line.me/test' },
    bookingStructured: () => ({ lang: 'EN' }), rentalContractLink: () => 'https://bot.example/fallback',
    bookingMessage: () => 'booking', bookingFetch: async () => ({ ok: false, status: 409, json: async () => ({ error: 'delivery_quote_required' }) }),
    URL,
  });
  vm.runInContext(fn('prepareContractHandoff'), context);
  await assert.rejects(context.prepareContractHandoff('AJ-20261014-RTEST'), { code: 'delivery_quote_required' });
});
