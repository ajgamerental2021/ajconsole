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
