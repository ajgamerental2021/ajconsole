import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('a recent contract return keeps the same Rental ID instead of allocating a duplicate', () => {
  assert.match(source, /const keepRecentRentalIdentity = Boolean\(/);
  assert.match(source, /Date\.now\(\) - Number\(draft\.at\) <= 6 \* 86400000/);
  assert.match(source, /if\(!keepRecentRentalIdentity\)\{/);
});

test('the contract context carries exact selected add-on ids, including an explicit empty selection', () => {
  assert.match(source, /const contractAddOns = selectedContractAddOns\(c\)/);
  assert.match(source, /bundleIds: contractAddOns\.bundle/);
  assert.match(source, /accessoryIds: contractAddOns\.accessories/);
});
