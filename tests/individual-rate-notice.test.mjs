import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('both payment summaries show the bilingual individual-rate notice and LINE link', () => {
  assert.match(page, /individualRateBefore:"ราคานี้เป็นเรทเช่าในนามบุคคล/);
  assert.match(page, /individualRateBefore:"This is an individual rental rate/);
  assert.match(page, /href="https:\/\/lin\.ee\/VLB7CBe"[^>]*>@ajgame<\/a>/);
  assert.match(page, /function demoPaymentBreakdownHtml[\s\S]*?\$\{individualRateNoticeHtml\(\)\}`;/);
  assert.match(page, /function payResumeHtml[\s\S]*?\$\{individualRateNoticeHtml\(\)\}/);
  assert.match(page, /\.individual-rate-notice\{margin:14px 0 16px;/);
});

test('resume payment shows the saved plan for the selected method beneath the total', () => {
  assert.match(page, /const selectedAmounts = r\.plan\?\.methods\?\.\[payResume\.method\]/);
  assert.match(page, /selectedAmounts\?\.fee \? row\(en \? "Payment fee"/);
  assert.match(page, /money\(selectedAmounts\?\.total \?\? r\.plan\?\.base \?\? 0\)/);
  assert.match(page, /paymentScheduleHtml\(\{upfront:selectedAmounts\.payNow, onDelivery:selectedAmounts\.onDelivery\}, payResume\.method\)/);
  const start = page.indexOf('  function paymentScheduleHtml(');
  const end = page.indexOf('  function renderDemoOrderPage()', start);
  const state = {lang:'th', calc:{payment:'credit'}};
  const render = new Function('state', 'esc', 'tr', 'money', 'upfrontLabel', `${page.slice(start, end)};return paymentScheduleHtml`)(
    state, value => String(value), key => key,
    amount => `฿${Number(amount).toLocaleString('en-US')}`,
    method => method === 'cash' ? (state.lang === 'en' ? 'Reservation' : 'ค่าจองคิว') : (state.lang === 'en' ? 'Full amount' : 'ชำระเต็มจำนวน'),
  );
  const html = render({upfront:200, onDelivery:2682}, 'cash');
  assert.match(html, /ยอดที่ต้องชำระ/);
  assert.match(html, /ชำระตอนนี้: ค่าจองคิว[\s\S]*฿200/);
  assert.match(html, /ชำระตอนรับเครื่อง[\s\S]*฿2,682/);
  state.lang = 'en';
  const english = render({upfront:3602, onDelivery:0}, 'credit');
  assert.match(english, /Amount due/);
  assert.match(english, /Pay now: Full amount[\s\S]*฿3,602/);
});
