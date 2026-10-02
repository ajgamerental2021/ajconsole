import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between = (start, end) => {
  const a = html.indexOf(start);
  return html.slice(a, html.indexOf(end, a + start.length));
};

test('a failed delivery price leaves the pay button usable, labelled for what happens next', () => {
  assert.match(html, /const canPay = deliveryReady \|\| deliveryQuoteFallback\(\);/);
  assert.match(html, /"Pay now · delivery fee later" : "ชำระเงิน · ค่าส่งจ่ายตอนรับเครื่อง"/);
  assert.match(html, /"Calculating delivery…" : "กำลังคำนวณค่าส่ง…"/);
  assert.doesNotMatch(html, /"Waiting for delivery price" : "รอราคาค่าส่ง"/);
});

test('the fallback is both failure kinds, and explained right above the button in TH and EN', () => {
  const fallback = between('function deliveryQuoteFallback(){', '\n  }');
  assert.match(fallback, /"unavailable"/);
  assert.match(fallback, /"needs_pin"/);
  assert.match(html, /<div class="demo-payment-launch">\$\{deliveryFallbackHtml\(\)\}<button/);
  assert.match(html, /ชำระค่าเช่าและค่าประกันได้เลย ร้านจะแจ้งค่าส่งทางแชท และชำระค่าส่งตอนรับเครื่อง/);
  assert.match(html, /You can still pay the rental and deposit now\. AJ will tell you the delivery fee in the chat, and you pay it on delivery\./);
});

test('one quiet retry before giving up on the live price', () => {
  const fetcher = between('async function fetchDemoDeliveryQuote(attempt = 0){', '\n  // No live price');
  assert.match(fetcher, /demoDelivery\.status === "unavailable" && attempt === 0/);
  assert.match(fetcher, /return fetchDemoDeliveryQuote\(1\);/);
  assert.match(fetcher, /rentalCode: state\.calc\.demoOrderOpen \? String\(state\.calc\.rentalCode \|\| ""\) : ""/);
});

test('paying without a live price goes ahead and marks the booking for AJ', () => {
  const launch = between('async function launchDemoBeamPayment(){', 'const summary = calcSummary();');
  assert.match(launch, /!deliveryQuoteFallback\(\)/);
  assert.doesNotMatch(launch, /return;\n\s+\}\n\s+\}\n\s+const summary/);
  assert.match(html, /deliveryPending: deliveryFeePending\(\),/);
  assert.match(html, /else if\(deliveryFeePending\(\)\) costs\.push\(\{label: en \? "Round-trip delivery" : "ค่าจัดส่งไป-กลับ", value: en \? "AJ to confirm, paid on delivery" : "ร้านแจ้งยอด ชำระตอนรับเครื่อง"\}\);/);
});
