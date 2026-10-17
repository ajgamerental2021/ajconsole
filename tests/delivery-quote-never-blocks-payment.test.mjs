import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between = (start, end) => {
  const a = html.indexOf(start);
  return html.slice(a, html.indexOf(end, a + start.length));
};

test('a failed delivery price disables payment until a complete quote exists', () => {
  assert.match(html, /const canPay = deliveryReady;/);
  assert.match(html, /"Delivery quote required" : "ต้องคำนวณค่าส่งก่อน"/);
  assert.match(html, /"Calculating delivery…" : "กำลังคำนวณค่าส่ง…"/);
  assert.doesNotMatch(html, /"Waiting for delivery price" : "รอราคาค่าส่ง"/);
});

test('the fallback is both failure kinds, and explained right above the button in TH and EN', () => {
  const fallback = between('function deliveryQuoteFallback(){', '\n  }');
  assert.match(fallback, /"unavailable"/);
  assert.match(fallback, /"needs_pin"/);
  assert.match(html, /<div class="demo-payment-launch">\$\{deliveryFallbackHtml\(\)\}<button/);
  assert.match(fallback, /"out_of_area"/);
  // Above the button: why, then check again or contact AJ on LINE / WhatsApp.
  assert.match(between('function deliveryFallbackHtml(){', '\n  }'), /deliveryQuoteStatusText\(\)[\s\S]*deliveryQuoteActionsHtml\(/);
  const actions = between('function deliveryQuoteActionsHtml(', '\n  }');
  assert.match(actions, /"Check delivery fee again" : "เช็คค่าส่งอีกครั้ง"/);
  assert.match(actions, /"Contact AJ on LINE" : "ติดต่อร้านทาง LINE"/);
  assert.match(actions, /\$\{en \? `<a [^`]*>Contact AJ on WhatsApp<\/a>` : ""\}/);
  assert.match(html, /เช็คค่าส่งกับ Lalamove ไม่สำเร็จชั่วคราว กรุณากดเช็คอีกครั้ง หรือติดต่อร้าน/);
  assert.match(html, /The delivery fee could not be checked with Lalamove just now\. Please check again, or contact AJ\./);
});

test('one quiet retry before giving up on the live price', () => {
  const fetcher = between('async function fetchDemoDeliveryQuote(attempt = 0){', '\n  // No live price');
  assert.match(fetcher, /demoDelivery\.status === "unavailable" && attempt === 0/);
  assert.match(fetcher, /return fetchDemoDeliveryQuote\(1\);/);
  assert.match(fetcher, /rentalCode: state\.calc\.demoOrderOpen \? String\(state\.calc\.rentalCode \|\| ""\) : ""/);
});

test('payment launch retries and stops without a live price', () => {
  const launch = between('async function launchDemoBeamPayment(){', 'const summary = calcSummary();');
  assert.match(launch, /try\{ await ensureDemoDeliveryQuote\(\); \}/);
  assert.match(launch, /else showDeliveryQuoteProblem\(\(\) => launchDemoBeamPayment\(\)\);/);
  assert.match(html, /if\(demoDelivery\.status !== "ready" \|\| !demoDelivery\.quote\) return;/);
  assert.match(html, /deliveryPending: deliveryFeePending\(\),/);
  assert.match(html, /else if\(deliveryFeePending\(\)\) costs\.push\(\{label: en \? "Round-trip delivery" : "ค่าจัดส่งไป-กลับ", value: en \? "AJ to confirm, paid on delivery" : "ร้านแจ้งยอด ชำระตอนรับเครื่อง"\}\);/);
});
