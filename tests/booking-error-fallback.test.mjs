import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('booking channels retain their normal handoff and show copy fallback only in catch paths', () => {
  for (const [fn, channel] of [['sendLine', 'line'], ['sendWhatsApp', 'whatsapp'], ['sendMessenger', 'messenger']]) {
    const start = source.indexOf(`async function ${fn}(`);
    const end = source.indexOf('\n  async function ', start + 20);
    const body = source.slice(start, end > start ? end : undefined);
    assert.match(body, /try\{/);
    assert.match(body, new RegExp(`showBookingFallback\\("${channel}", fallbackMessage, error\\)`));
    assert.match(body, /return true;/);
  }
});

test('fallback popup provides copy and direct channel actions in both languages', () => {
  assert.match(source, /bookingFallbackTitle:"ส่งรายการจองอัตโนมัติไม่สำเร็จ"/);
  assert.match(source, /bookingFallbackTitle:"Automatic booking delivery failed"/);
  assert.match(source, /modal\.dataset\.mode = "booking-fallback"/);
  assert.match(source, /await writeBookingClipboard\(bookingFallbackMessage\)/);
  assert.match(source, /await copyBookingFallback\(\)\.catch\(\(\) => false\)/);
});

test('availability conflicts do not offer an invalid copy fallback', () => {
  assert.match(source, /if\(error\?\.code === "booking_hold_conflict"\) return showBookingActionError\(error\)/);
});
