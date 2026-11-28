import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// 28/11/2026: a customer's network reset every connection to ajgamerental.com.
// The Render address forwards only once the domain answers from that device.
test('the Render address moves to the domain only when the domain answers; ?stay=1 never moves', () => {
  const block = html.slice(html.indexOf('const CANONICAL_HOST'), html.indexOf('const PAGE_PARAMS'));
  assert.match(block, /new URLSearchParams\(location\.search\)\.get\("stay"\) !== "1"/);
  assert.match(block, /probe\.onload = \(\) => done\(true\);/);
  assert.match(block, /probe\.onerror = \(\) => done\(false\);/);
  assert.match(block, /window\.setTimeout\(\(\) => done\(false\), 2500\);/);
  assert.match(block, /probe\.src = `https:\/\/\$\{CANONICAL_HOST\}\/assets\/reach\.gif\?t=\$\{Date\.now\(\)\}`;/);
  assert.doesNotMatch(block.replace(/if\(reachable\) location\.replace\(target\);/, ''), /location\.replace/, 'no move that does not wait for the answer');
  assert.ok(fs.statSync(new URL('../assets/reach.gif', import.meta.url)).size < 100);
});
