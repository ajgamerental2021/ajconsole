import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../rental-flow-demo.html', import.meta.url), 'utf8');

test('separate demo entry enables the feature-gated unified flow', () => {
  assert.match(entry, /flowDemo', '1'/);
  assert.match(entry, /booking', '1'/);
  assert.match(html, /const UNIFIED_FLOW_DEMO = PAGE_PARAMS\.get\("flowDemo"\) === "1"/);
  assert.match(html, /body\.classList\.add\("unified-flow-demo"\)/);
});

test('demo reuses live game, payment, customer and agreement controls', () => {
  assert.match(html, /demoGameHost/);
  assert.match(html, /demoPaymentHost/);
  assert.match(html, /demoCustomerName/);
  assert.match(html, /demoCustomerPhone/);
  assert.match(html, /frameUrl\.searchParams\.set\("flowDemo", "1"\)/);
  assert.match(html, /AJ_CONTRACT_COMPLETED/);
});

test('demo customer details are included in the real booking context', () => {
  assert.match(html, /customerName: String\(state\.calc\.demoCustomerName/);
  assert.match(html, /phone: String\(state\.calc\.demoCustomerPhone/);
  assert.match(html, /customerDataSource: UNIFIED_FLOW_DEMO/);
});
