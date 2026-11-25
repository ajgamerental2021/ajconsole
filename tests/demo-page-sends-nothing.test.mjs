import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * index-demo.html is reachable on the public site (25/11/2026): it is never
 * indexed and never sends a booking anywhere — no Sheet row, no payment link,
 * no LINE card, no contract, no chat message.
 */
const demo = readFileSync(new URL('../index-demo.html', import.meta.url), 'utf8');

const body = (name) => {
  const start = demo.search(new RegExp(`\\n  (async )?function ${name}\\(`));
  assert.ok(start > 0, name);
  return demo.slice(start, start + 400);
};

test('not indexed, and says it is a demo in both languages', () => {
  assert.match(demo, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(demo, /id="demoPageBanner"[^>]*>หน้าทดลอง · ไม่ส่งการจองจริง[\s\S]*Demo page · bookings are not sent/);
  assert.match(demo, /const DEMO_PAGE_SENDS_NOTHING = true;/);
});

test('every way a booking leaves the page is shut', () => {
  assert.match(body('ensureBeamPaymentLink'), /^\s*\n  async function ensureBeamPaymentLink\(summary, rentalCode\)\{\n    if\(DEMO_PAGE_SENDS_NOTHING\) return "";/);
  assert.match(body('submitRentalToSheet'), /\{\n    if\(DEMO_PAGE_SENDS_NOTHING\) return;/);
  assert.match(body('pushLineGamePickerCard'), /\{\n    if\(DEMO_PAGE_SENDS_NOTHING\) return;/);
  assert.match(body('guardedBookingShare'), /\{\n    if\(demoBlocked\(\)\) return false;/);
  assert.match(body('openContract'), /\{\n    if\(demoBlocked\(\)\) return;/);
});

test('the only POSTs left are the guarded ones and the admin Gist save', () => {
  const posts = [...demo.matchAll(/method:\s*"?(POST|PATCH)|method:create \? "POST"/g)].length;
  // Beam link, Sheet row, LINE card, Gist save (admin token only).
  assert.equal(posts, 4);
});
