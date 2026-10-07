import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Thai checkout requires a verified LINE connection before context and payment', () => {
  assert.match(page, /if\(!payResume\.active && \(state\.lang === "th" \|\| demoProfile\.preferredContactChannel === "line"\)\) need\("lineConnectBtn", !!activeLineConnection\(\)/);
  assert.match(page, /lineConnectionToken:UNIFIED_FLOW_DEMO \? \(bookingLineConnection\(\)\?\.token \|\| ""\) : ""/);
  assert.match(page, /bookingContextToken: UNIFIED_FLOW_DEMO \? String\(state\.calc\.demoContextToken \|\| ""\) : ""/);
  assert.match(page, /if\(UNIFIED_FLOW_DEMO\) throw error;/);
});

test('English checkout offers WhatsApp and allows no channel selection', () => {
  assert.match(page, /id="demoWhatsAppConnectBtn"/);
  assert.doesNotMatch(page, /id="demoEmailContactBtn"/);
  assert.match(page, /demo-line-btn/);
  assert.match(page, /demo-wa-btn/);
  assert.match(page, /contactBrandIcon\("line"\)/);
  assert.match(page, /contactBrandIcon\("whatsapp"\)/);
  assert.match(page, /demoProfile\.preferredContactChannel = "whatsapp"/);
  assert.match(page, /contactChannel: UNIFIED_FLOW_DEMO \? \(en \? \(demoProfile\.preferredContactChannel \|\| "email"\) : "line"\)/);
  assert.match(page, /lineBindUrl/);
  assert.match(page, /rentalContactWhatsApp/);
});
