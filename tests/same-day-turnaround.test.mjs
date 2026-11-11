import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 12/11/2026: XBOX Series S was booked 21–24/11, and the calendar still let a
// customer pick 18/11 → return 21/11: the unit would come back on the day it
// has to go out. A rental holds its unit through its return day, so the next
// one starts the day after (only once the return job is done can it go out
// that same day, which the payload shows by releasing the ended range).
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = html.slice(html.indexOf('function rowAvailableForRange(row, start, end){'));
const body = source.slice(0, source.indexOf('\n  }\n') + 4);
const rowAvailableForRange = new Function(`${body}; return rowAvailableForRange;`)();
const day = (n) => new Date(2026, 10, n);
// As normalizeAvailabilityRows stores a booking 21–24/11: returnDate is the day after the return.
const row = { status: 'available', bookingRanges: [{ startDate: day(21), returnDate: day(25) }] };

test('a rental may not come back on the day the next one starts', () => {
  assert.equal(rowAvailableForRange(row, day(18), day(21)), false, '18 → 21 against 21–24: refused');
  assert.equal(rowAvailableForRange(row, day(17), day(20)), true, '17 → 20: back the day before');
});

test('nor go out on the day another comes back', () => {
  assert.equal(rowAvailableForRange(row, day(24), day(27)), false, '24 → 27: out on its return day');
  assert.equal(rowAvailableForRange(row, day(25), day(28)), true, '25 → 28: the day after');
});

test('overlaps are still refused, free days still free', () => {
  assert.equal(rowAvailableForRange(row, day(19), day(23)), false);
  assert.equal(rowAvailableForRange(row, day(10), day(13)), true);
});

test('the demos and the live page use the same rule', () => {
  for (const file of ['../index-demo.html', '../index-depth-demo.html']) {
    const page = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(page, /start < range\.returnDate && end >= range\.startDate\);/, file);
  }
});
