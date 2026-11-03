import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the stats page learns how many days were picked and booked', () => {
  // Every event can carry the days; the payload sends them as a number.
  assert.match(html, /rentalDays:Number\(details\.rentalDays\) \|\| 0/);
  // Applying the calendar range reports the days picked, with the device.
  assert.match(html, /trackAnalytics\("rental_dates_selected", \{value:String\(days\), rentalDays:days, deviceId:state\.calc\.consoleId/);
  // Each booking handoff (LINE, WhatsApp, Messenger) carries the rental's days.
  assert.equal(html.match(/trackAnalytics\("booking_handoff_started", \{[^}]*rentalDays:summary\.days/g)?.length, 3);
});
