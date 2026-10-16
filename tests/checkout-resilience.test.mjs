import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Things that stopped a renter between step 3 and Beam, found by driving the
// real Bot end to end: slow photo uploads, a payment group that snapped shut,
// and a delivery quote the Bot forgot across a deploy.

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.search(new RegExp(`\\n  (?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} exists`);
  const from = start + 1;
  return source.slice(from, source.indexOf('\n  }\n', from) + 4);
}

test('identity photos are sent small and prepared as soon as they are chosen', () => {
  assert.match(source, /const IDENTITY_PHOTO_EDGE = 1440;/);
  assert.match(source, /const IDENTITY_PHOTO_MAX_BYTES = 300 \* 1024;/);
  const encode = fn('encodeDemoIdentityImage');
  assert.match(encode, /encode\(IDENTITY_PHOTO_EDGE, 0\.72\)/);
  assert.match(encode, /encode\(1280, 0\.62\)/);
  // Both ways of choosing a photo start preparing it straight away.
  assert.equal(source.match(/prepareDemoIdentityImage\(file\);/g)?.length, 2);
  // One encoding per photo, reused when the photos are sent.
  assert.match(fn('demoImageDataUrl'), /demoImageEncodings\.get\(file\)/);
});

test('an opened payment group stays open when the page redraws', () => {
  const context = {
    state: { lang: 'en', calc: { payment: 'cash' } },
    demoDelivery: { status: 'ready' },
    wisePaymentAvailability: () => ({ available: true }),
    bangkokNow: () => ({ iso: '2026-10-16' }),
    cashDeliveryOptionHtml: () => 'cash', creditOptionHtml: () => 'credit', ewalletOptionHtml: () => 'ewallet', wiseOptionHtml: () => 'wise',
    paymentOptionAmountHtml: () => '',
  };
  vm.runInNewContext(`const paymentGroupOpened = {};\n${fn('paymentPickerHtml')}\nthis.picker = paymentPickerHtml; this.opened = paymentGroupOpened;`, context);
  const fullGroupOpen = (html) => /<div class="payment-group ">\s*<button class="payment-group-title" type="button" data-payment-group="full"/.test(html);
  assert.equal(fullGroupOpen(context.picker()), false, 'reservation leads by default');
  context.opened.paymentChoice = 'full';
  assert.equal(fullGroupOpen(context.picker()), true, 'a redraw keeps the group the renter opened');
  // The private payment page has its own picker and its own memory.
  assert.equal(fullGroupOpen(context.picker({ inputName: 'payResumeChoice' })), false);
  assert.match(source, /if\(choice\?\.name\) paymentGroupOpened\[choice\.name\] = paymentGroup\.dataset\.paymentGroup;/);
});

test('Pay now quotes again when the Bot no longer knows the quote, and stops if the price moved', () => {
  const launch = fn('launchDemoBeamPayment');
  const retry = launch.indexOf('if(error?.code !== "delivery_quote_required") throw error;');
  assert.ok(retry > 0);
  assert.ok(launch.indexOf('await ensureDemoDeliveryQuote(true);', retry) > retry);
  assert.match(launch, /if\(\(Number\(demoDelivery\.quote\?\.total\) \|\| 0\) !== shownTotal\)\{[\s\S]*?toast\(state\.lang === "en" \? "The delivery fee was updated\. Please check the new total, then tap Pay now again\." : "ค่าจัดส่งอัปเดตแล้ว กรุณาตรวจยอดใหม่ แล้วกดชำระเงินอีกครั้ง", 6000\);\s*return;/);
  // The sealed quote travels with the booking and with the recorded quote.
  assert.match(source, /quotationId:String\(demoDelivery\.quote\.outbound\?\.quotationId \|\| ""\), seal:String\(demoDelivery\.quote\.seal \|\| ""\)\}/);
  assert.match(fn('recordDemoDeliveryQuote'), /JSON\.stringify\(\{quotationId, seal:String\(quote\?\.seal \|\| ""\)\}\)/);
});

test('the pay-later email uses the newest booking context', () => {
  assert.match(fn('maybeSendPayLaterEmail'), /body:JSON\.stringify\(\{contextToken:state\.calc\.demoContextToken \|\| contextToken\}\)/);
});
