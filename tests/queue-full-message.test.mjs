import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 19/11/2026: a customer pressed Pay for PS5 02/12–11/12 and was told only
// "Unable to open the payment page". The queue was full (the last free PS5 is
// back on 02/12 and out again from the 3rd's point of view); the page now says
// so, with the earliest start for the same rental, and takes them back to the
// dates — on the booking page and on the emailed payment link alike.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const slice = (from, to) => html.slice(html.indexOf(from), html.indexOf(to));
const src = slice('  /** The first start, from the one asked for,', '  /** The booking page: Pay found the queue full');

const parseDate = (v) => { if (v instanceof Date) return v; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const fmtIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const diffDays = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
const displayDate = (v) => { const d = parseDate(v); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };

function load(lang, freeFrom) {
  // A queue where the console is free for any rental starting on/after freeFrom.
  const evaluateAvailability = (ctx) => (parseDate(ctx.start) >= freeFrom ? { pass: true, mode: 'ok' } : { pass: false, mode: 'busy', message: 'busy' });
  const deps = { state: { lang }, parseDate, fmtIso, addDays, diffDays, displayDate, evaluateAvailability,
    earliestRentalStartIso: () => '2026-11-20', consoleById: () => ({ id: 'ps5' }), cName: () => 'PS5', tr: (k) => k };
  return new Function(...Object.keys(deps), `${src}; return { earliestFreeStart, queueFullText };`)(...Object.values(deps));
}

test('the full queue is said, with the earliest start for the same number of days (TH/EN)', () => {
  const ctx = { consoleId: 'ps5', start: '2026-12-02', end: '2026-12-11' };
  const th = load('th', new Date(2026, 11, 3));
  assert.equal(fmtIso(th.earliestFreeStart(ctx)), '2026-12-03');
  assert.equal(th.queueFullText(ctx, { pass: false, mode: 'busy' }), 'PS5 คิวเต็มช่วง 02/12/2026 – 11/12/2026 แล้ว เช่า 9 วันได้เร็วสุดเริ่ม 03/12/2026 (คืน 12/12/2026)');
  const en = load('en', new Date(2026, 11, 3));
  assert.equal(en.queueFullText(ctx, { pass: false, mode: 'busy' }), 'PS5 is fully booked for 02/12/2026 – 11/12/2026. The earliest a 9-day rental can start is 03/12/2026 (return 12/12/2026).');
});

test('someone paying right now, or a closed queue, says that instead; nothing free in six months: choose other dates', () => {
  const ctx = { consoleId: 'ps5', start: '2026-12-02', end: '2026-12-11' };
  const th = load('th', new Date(2027, 11, 1));
  assert.equal(th.queueFullText(ctx, { pass: false, mode: 'hold', message: 'มีลูกค้ารายอื่นกำลังจองเครื่องนี้ กรุณาเช็คคิวใหม่ใน 8 นาที' }), 'มีลูกค้ารายอื่นกำลังจองเครื่องนี้ กรุณาเช็คคิวใหม่ใน 8 นาที');
  assert.equal(th.queueFullText(ctx, { pass: false, mode: 'busy' }), 'PS5 คิวเต็มช่วง 02/12/2026 – 11/12/2026 แล้ว กรุณาเลือกวันอื่น');
});

test('Pay on the booking page shows it and goes back to the dates; the payment link lets them pick new dates there', () => {
  const pay = slice('async function launchDemoBeamPayment(', '// The pay-later email:');
  assert.match(pay, /if\(error\?\.code === "booking_hold_conflict"\)\{\s*showQueueFullPopup\(calcRentalContext\(\), error\.message\);/);
  assert.match(html, /data-queue-back-to-dates>\$\{esc\(en \? "Choose new dates" : "เลือกวันเช่าใหม่"\)\}/);
  // Back to step 1 with the start date framed and the calendar open (26/11/2026).
  assert.match(html, /if\(event\.target\.closest\("\[data-queue-back-to-dates\]"\)\)\{ closeModal\(\); focusProgressProblem\(\{step:1, field:"startDate"\}\); return; \}/);
  assert.match(html, /if\(focus\.step && focus\.step !== state\.calc\.step\) goCalcStep\(focus\.step, \{scrollTabs:true\}\);/);
  const popup = slice('function showPayResumeQueuePopup(message){', 'async function checkPayResumeQueue(');
  assert.match(popup, /data-pay-resume-new-dates/);
  assert.match(popup, /เลือกวันเช่าใหม่ได้เองเลย แล้วชำระเงินต่อได้ทันที/);
  assert.match(popup, /Choose new dates below and pay for them straight away/);
  assert.match(html, /if\(event\.target\.closest\("\[data-pay-resume-new-dates\]"\)\)\{ closeModal\(\); openCalendar\("start", \{fromOrder:true\}\); return; \}/);
});
