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
});
