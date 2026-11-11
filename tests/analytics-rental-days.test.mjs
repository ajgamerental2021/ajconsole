import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the stats page learns how many days were picked and booked', () => {
  // Every event can carry the days; the payload sends them as a number.
  assert.match(html, /rentalDays:Number\(details\.rentalDays\) \|\| 0/);
  // Applying the calendar range reports the days picked, with the device.
  assert.match(html, /trackAnalytics\("rental_dates_selected", \{value:String\(days\), rentalDays:days, deviceId:state\.calc\.consoleId/);
  // One "booking sent" per rental, with its days, however it was sent: counted
  // where every rental is saved, so the website's own agreement-and-payment
  // flow counts too (11/11/2026: only LINE, WhatsApp and Messenger did).
  assert.equal(html.match(/trackAnalytics\("booking_handoff_started", \{[^}]*rentalDays:summary\.days/g)?.length, 1);
  const submit = html.slice(html.indexOf('async function submitRentalToSheet('));
  const saved = submit.indexOf('localStorage.setItem(`aj_rental_sheet_submitted_${code}`, contentKey);');
  assert.ok(saved > 0 && submit.indexOf('trackBookingSubmitted(summary, code, channel);') > saved, 'counted once the row is saved');
  const helper = html.slice(html.indexOf('function trackBookingSubmitted('), html.indexOf('async function submitRentalToSheet('));
  assert.match(helper, /aj_rental_booked_tracked_\$\{code\}/, 'once per rental');
  assert.match(helper, /: "web", rentalId:code/, 'the website flow is the web channel');
});
