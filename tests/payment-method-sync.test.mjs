import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Console Pending submissions use the acknowledged Bot upsert and are awaited', () => {
  assert.match(html, /new URL\("\/api\/console-pending-submissions", CONFIG\.contractWebUrl\)/);
  assert.doesNotMatch(html, /fetch\(endpoint, \{method:"POST", mode:"no-cors"/);
  assert.equal((html.match(/await submitRentalToSheet\(/g) || []).length, 5);
  assert.match(html, /if\(!response\.ok \|\| !result\?\.ok\) throw new Error/);
});

test('booking viewer reads the latest server row and never recovers an old Beam URL', () => {
  assert.match(html, /fetch\(bookingEndpoint, \{cache:"no-store"\}\)/);
  assert.doesNotMatch(html, /normalizeViewerCashPaymentBlock/);
  assert.doesNotMatch(html, /source\.match\(\/https:\\\/\\\/pay\\\.beamcheckout/);
});

test('website fees use the same basis-point ceiling formula as the Bot', () => {
  assert.match(html, /basisPoints = state\.calc\.payment === "credit" \? 350 : \(state\.calc\.payment === "ewallet" \? 295 : 0\)/);
  assert.match(html, /Math\.ceil\(\(\(Number\(amount\) \|\| 0\) \* basisPoints\) \/ 10000\)/);
  assert.match(html, /state\.lang === "en" && state\.calc\.payment === "cash"\) return Math\.min\(1000, Number\(summary\.total\) \|\| 0\)/);
});
