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
const keySource = html.slice(html.indexOf('function requestKey(code){'), html.indexOf('function rowAvailableForRange(row, start, end){'));
const state = { calc: { rentalCode: '' } };
const requestKey = new Function(`${keySource}; return requestKey;`)();
const rowAvailableForRange = new Function('state', 'requestKey', `${body}; return rowAvailableForRange;`)(state, requestKey);
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

test("an unpaid website request's hold blocks others, never its own checkout (14/11/2026)", () => {
  // As the app publishes it: the range carries a key of the request's code.
  assert.equal(requestKey('AJ-20261114-R0007'), 'daaf1820', 'the same key as the app (publicAvailability.requestKey)');
  const held = { status: 'available', bookingRanges: [{ startDate: day(21), returnDate: day(25), request: requestKey('AJ-20261114-R0007') }] };
  state.calc.rentalCode = '';
  assert.equal(rowAvailableForRange(held, day(21), day(24)), false, 'a new customer: held');
  state.calc.rentalCode = 'AJ-20261114-R0099';
  assert.equal(rowAvailableForRange(held, day(21), day(24)), false, 'another request: held');
  state.calc.rentalCode = 'aj-20261114-r0007';
  assert.equal(rowAvailableForRange(held, day(21), day(24)), true, 'its own payment step / resume: not in its own way');
  state.calc.rentalCode = '';
});

// 18/11/2026, as live: R0218 paid and was booked (the queue shows its range
// with its key) while its 30-minute checkout hold was still on the Bot; R0204
// could not pay for its own unit because that hold was counted a second time.
test('a checkout hold for a rental already in the queue is not counted again; nor is its own from another browser', () => {
  const src = html.slice(html.indexOf('function matchingBookingHolds(c, start, end, includeMine=false){'), html.indexOf('function activeBookingHolds('));
  const st = { calc: { rentalCode: 'AJ-20261118-R0204' }, availability: { rows: [
    { deviceName: 'PS5', bookingRanges: [{ startDate: '2026-11-28', returnDate: '2026-12-02', rental: requestKey('AJ-20261118-R0218') }] },
    { deviceName: 'PS5', bookingRanges: [{ startDate: '2026-11-27', returnDate: '2026-12-05', request: requestKey('AJ-20261118-R0204') }] },
  ], holds: [] } };
  const norm = (v) => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const parseDate = (v) => (v ? new Date(`${v}T00:00:00`) : null);
  const matching = new Function('state', 'requestKey', 'availabilityAliases', 'norm', 'parseDate', `${src}; return matchingBookingHolds;`)(
    st, requestKey, () => new Set(['ps5']), norm, parseDate);
  const later = new Date(Date.now() + 20 * 60_000).toISOString();
  const hold = (rentalCode) => ({ rentalCode, deviceName: 'PS5', startDate: '2026-11-28', endDate: '2026-12-01', expiresAt: later, mine: false });
  st.availability.holds = [hold('AJ-20261118-R0218'), hold('AJ-20261118-R0204'), hold('AJ-20261118-R0300')];
  const counted = matching({}, parseDate('2026-11-27'), parseDate('2026-12-04')).map((h) => h.rentalCode);
  assert.deepEqual(counted, ['AJ-20261118-R0300'], 'only a rental the queue does not already show');
  assert.equal(matching({}, parseDate('2026-11-27'), parseDate('2026-12-04'), true).length, 3, 'includeMine lists every hold');
});
