import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('without identity verification every PS5 bundle holds ฿15,000', () => {
  assert.match(html, /const finalDeposit = state\.calc\.noContract \? \(bundleName \? 15000 : noContractDeposit\(deposit, c\)\) : deposit;/);
});

test('the no-identity badge shows the bundle deposit too', () => {
  assert.match(html, /depositBadge\(demoDepositChoices\(\)\.noId, "danger"\)/);
});

test('PS5 + Logitech G29 is quoted for a car, and a bundle change re-quotes', () => {
  const fn = html.slice(html.indexOf('function deliveryNeedsCar()'), html.indexOf('async function fetchDemoDeliveryQuote()'));
  assert.match(fn, /bundle\?\.th, bundle\?\.en/);
  assert.match(fn, /\/G29\|Logitech\/i\.test\(name\)/);
  assert.match(html, /hasLargeItem: deliveryNeedsCar\(\),/);
  assert.match(html, /state\.calc\.consoleId, state\.calc\.bundleId \|\| "", state\.calc\.extras/);
  const bundles = html.slice(html.indexOf('{id:"ps5_g29"'), html.indexOf('{id:"ps5_g29"') + 80);
  assert.match(bundles, /en:"PS5 \+ Logitech G29"/);
});

test('every page that explains the no-identity deposit names the PS5 bundle figure (TH/EN)', () => {
  assert.match(html, /Bundle PS5 → ฿15,000/);
  assert.match(html, /PS5 bundles → ฿15,000/);
});
