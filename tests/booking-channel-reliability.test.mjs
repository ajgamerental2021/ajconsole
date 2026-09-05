import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('LINE remains visibly recommended without removing Messenger', () => {
  assert.match(source, /recommendedChannel:"ช่องทางแนะนำ"/);
  assert.match(source, /recommendedChannel:"Recommended"/);
  assert.match(source, /class="summary-recommended-channel"/);
  assert.match(source, /id="sendMessenger"/);
});

test('booking channels retain the availability hold when payment-link creation fails', () => {
  const helperStart = source.indexOf('async function prepareBookingPayment');
  const helperEnd = source.indexOf('\n  function showBookingActionError', helperStart);
  const helper = source.slice(helperStart, helperEnd);

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.match(helper, /await ensureBookingHold\(rentalCode\)/);
  assert.match(helper, /ensureBeamPaymentLink\(summary, rentalCode, \{holdAcquired:true\}\)/);
  assert.match(helper, /Payment link unavailable; continuing with booking handoff/);
  assert.match(helper, /return ""/);
});

test('LINE, WhatsApp, and Messenger all use the resilient payment preparation', () => {
  for (const name of ['sendLine', 'sendWhatsApp', 'sendMessenger']) {
    const start = source.indexOf(`async function ${name}`);
    const end = source.indexOf('\n  }', start) + 4;
    const fn = source.slice(start, end);
    assert.match(fn, /await prepareBookingPayment\(summary, code\)/, `${name} bypasses payment fallback`);
  }
});
