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
  // A changed price is shown (old and new) before anything is charged.
  assert.match(launch, /if\(quoteError\?\.code === "delivery_quote_changed"\) showDeliveryQuoteChanged\(quoteError, \(\) => launchDemoBeamPayment\(\)\);/);
  // The sealed quote travels with the booking and with the recorded quote.
  assert.match(source, /quotationId:String\(demoDelivery\.quote\.outbound\?\.quotationId \|\| ""\), seal:String\(demoDelivery\.quote\.seal \|\| ""\)\}/);
  assert.match(fn('recordDemoDeliveryQuote'), /JSON\.stringify\(\{quotationId, seal:String\(quote\?\.seal \|\| ""\)\}\)/);
});

test('the pay-later email uses the newest booking context', () => {
  assert.match(fn('maybeSendPayLaterEmail'), /body:JSON\.stringify\(\{contextToken:state\.calc\.demoContextToken \|\| contextToken\}\)/);
});

test('the delivery fee shows in step 2 and step 3 cannot open without it (TH/EN)', () => {
  // Under the delivery place, quoted as soon as the place is known.
  assert.match(source, /\$\{demoMapsFoundHtml\(\)\}\$\{demoDeliveryQuoteBoxHtml\(\)\}/);
  assert.match(fn('renderDemoMapsFound'), /scheduleDemoDeliveryQuote\(\);/);
  // Only a new place, device or dates is quoted on its own (no retry loop).
  assert.match(fn('scheduleDemoDeliveryQuote'), /demoDelivery\.key === demoDeliveryQuoteKey\(\) && demoDelivery\.status !== "idle"/);
  // Taking long: after 10 s the renter can check again or contact AJ.
  assert.match(fn('fetchDemoDeliveryQuote'), /demoDelivery\.slow = true;[\s\S]*?\}, 10000\);/);
  assert.match(source, /"Still checking the delivery fee with Lalamove\. This is taking longer than usual — you can check again or contact AJ\." : "ยังเช็คค่าส่งกับ Lalamove อยู่ ใช้เวลานานกว่าปกติ กดเช็คอีกครั้ง หรือติดต่อร้านได้"/);
  assert.match(source, /"Lalamove does not deliver to this location\. Please check the pin, or contact AJ to arrange delivery\."\s*:\s*"Lalamove ไม่ให้บริการส่งถึงตำแหน่งนี้ กรุณาตรวจหมุด หรือติดต่อร้านเพื่อจัดการการส่ง"/);
  // Step 2 → 3 is gated on a confirmed quote, with the same dialog as confirm.
  const advance = fn('advanceDemoStep');
  assert.match(advance, /try\{ await ensureDemoDeliveryQuote\(\); \}\s*catch\(error\)\{[\s\S]*?showDeliveryQuoteChanged\(error, \(\) => advanceDemoStep\(next\)\);\s*else showDeliveryQuoteProblem\(\(\) => advanceDemoStep\(next\)\);/);
  const dialog = fn('showDeliveryQuoteProblem');
  assert.match(dialog, /data-delivery-quote-retry-continue/);
  assert.match(dialog, /CONFIG\.lineUrl/);
  // Thai: LINE only. English: LINE and WhatsApp.
  for (const html of [dialog, fn('deliveryQuoteActionsHtml')]) {
    assert.match(html, /\$\{en \? `<a class="btn" href="https:\/\/wa\.me\/message\/LEJ5QD3B2D2TN1" target="_blank" rel="noopener">Contact AJ on WhatsApp<\/a>` : ""\}/);
    assert.doesNotMatch(html, /ติดต่อร้านทาง WhatsApp/);
  }
  assert.match(fn('fetchDemoDeliveryQuote'), /stage: payResume\.active \? "pay_resume" : "booking",/);
});

test('a delivery price older than 30 minutes is asked for again; a changed one is shown before paying', async () => {
  const demoDelivery = { status: 'ready', key: 'k', quote: { subtotal: 430, discount: 200, total: 230, outbound: { quotationId: 'q1' } }, quotedAt: Date.now() - 29 * 60 * 1000 };
  let next = { subtotal: 530, discount: 200, total: 330, outbound: { quotationId: 'q2' } };
  const context = {
    demoDelivery, DELIVERY_QUOTE_FRESH_MS: 28 * 60 * 1000, Date, Number, Object, Error,
    demoDeliveryQuoteKey: () => 'k', renderDeliveryQuoteViews() {},
    fetchDemoDeliveryQuote: async () => { demoDelivery.status = 'ready'; demoDelivery.quote = next; demoDelivery.quotedAt = Date.now(); },
  };
  vm.runInNewContext(`${fn('confirmedDemoDeliveryQuote')}\n${fn('ensureDemoDeliveryQuote')}\nthis.ensure = ensureDemoDeliveryQuote;`, context);
  await assert.rejects(context.ensure(), (error) => error.code === 'delivery_quote_changed' && error.before === 230 && error.after === 330);
  assert.equal(demoDelivery.previousTotal, 230);
  // Fresh now: going on again does not ask Lalamove or complain.
  await context.ensure();
  // Same price after expiry: no interruption.
  demoDelivery.quotedAt = Date.now() - 29 * 60 * 1000;
  next = { ...next, outbound: { quotationId: 'q3' } };
  await context.ensure();
  assert.equal(demoDelivery.quote.outbound.quotationId, 'q3');
  // The dialog shows old and new, says nothing was charged, TH and EN.
  const dialog = fn('showDeliveryQuoteChanged');
  assert.match(dialog, /"Delivery fee updated" : "ค่าจัดส่งอัปเดตแล้ว"/);
  assert.match(dialog, /"Continue with the new price" : "ดำเนินการต่อด้วยยอดใหม่"/);
  assert.match(dialog, /ยังไม่มีการเก็บเงิน ราคาใหม่นี้ใช้ได้ 30 นาที/);
  assert.match(source, /const DELIVERY_QUOTE_FRESH_MS = 28 \* 60 \* 1000;/);
});

test('the emailed payment link shows a moved delivery price before paying (TH/EN)', () => {
  const launch = fn('launchPayResume');
  // The Bot asks Lalamove again after 30 minutes; a new price comes back with
  // the rental, whose new amounts are shown under the old-and-new dialog.
  assert.match(launch, /if\(error\?\.code === "delivery_quote_changed"\)\{[\s\S]*?payResume\.rental = error\.result\.rental;\s*hydratePayResumeEditor\(error\.result\.rental\);[\s\S]*?showDeliveryQuoteChanged\(error\.result \|\| \{\}, \(\) => launchPayResume\(\)\);/);
  // No price: the same "delivery fee needed first" dialog as the booking page.
  assert.match(launch, /if\(error\?\.code === "delivery_quote_required" \|\| error\?\.code === "delivery_out_of_area"\)\{[\s\S]*?showDeliveryQuoteProblem\(\(\) => launchPayResume\(\)\);/);
  // Both the Beam and the Wise answers carry the Bot's reply to the handler.
  assert.equal(launch.match(/\{code:result\.error \|\| "", result\}/g)?.length, 2);
  // A rental priced only now has no "before" to strike through.
  const dialog = fn('showDeliveryQuoteChanged');
  assert.match(dialog, /"Lalamove has now priced the round-trip delivery for this rental\." : "ได้ราคาค่าส่งไป-กลับจาก Lalamove สำหรับรายการนี้แล้ว"/);
  assert.match(dialog, /\$\{shownBefore \? `<div class="delivery-quote-row">/);
});
