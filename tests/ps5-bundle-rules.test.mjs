import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('without identity verification every PS5 bundle holds ฿15,000', () => {
  assert.match(html, /const finalDeposit = state\.calc\.noContract \? \(bundleName \? 15000 : noContractDeposit\(deposit\)\) : deposit;/);
});

test('the no-identity badge shows the bundle deposit too', () => {
  assert.match(html, /depositBadge\(Number\(selectedConsole\.id\) === SPEC\.PS5 && state\.calc\.bundleId \? 15000 : noContractDeposit\(selectedConsole\.deposit\), "danger"\)/);
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
