import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const line = (name) => {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n', start));
};
const fn = (name) => {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  }', start) + 4);
};

function planner(today, earliest) {
  const ctx = vm.createContext({});
  vm.runInContext([line('dateOnly'), fn('parseDate'), line('fmtIso'), line('addDays'), line('diffDays'), fn('startShiftPlan'),
    `function todayIso(){ return ${JSON.stringify(today)}; } function earliestRentalStartIso(){ return ${JSON.stringify(earliest)}; }`,
    'this.startShiftPlan = startShiftPlan;'].join('\n'), ctx);
  return ctx.startShiftPlan;
}

test('today after the cutoff: tomorrow, same number of days (AJ-20261105-R0025)', () => {
  const plan = planner('2026-11-05', '2026-11-06');
  assert.deepEqual({ ...plan({ start: '2026-11-05', end: '2026-11-12' }) }, { start: '2026-11-06', end: '2026-11-13', days: 7, tomorrow: true });
  assert.equal(plan({ start: '2026-11-06', end: '2026-11-13' }), null, 'already tomorrow: nothing to move');
  assert.equal(plan({ start: '', end: '' }), null);
});

test('a start day already over, before today\'s cutoff: today; the server\'s later date wins', () => {
  assert.deepEqual({ ...planner('2026-11-05', '2026-11-05')({ start: '2026-11-04', end: '2026-11-07' }) }, { start: '2026-11-05', end: '2026-11-08', days: 3, tomorrow: false });
  // The page still thinks today is fine; the Bot says the cutoff passed.
  assert.deepEqual({ ...planner('2026-11-05', '2026-11-05')({ start: '2026-11-05', end: '2026-11-08' }, '2026-11-06') }, { start: '2026-11-06', end: '2026-11-09', days: 3, tomorrow: true });
});

test('both Pay buttons ask first; the shift re-checks the queue and saves before paying (TH/EN)', () => {
  assert.match(source, /if\(showStartPassedPopup\("resume", payResumeContext\(r\)\.ctx\)\) return;/);
  assert.match(source, /if\(showStartPassedPopup\("order", calcRentalContext\(\)\)\) return;\n    showDemoBusy\(/);
  assert.match(source, /if\(error\?\.code === "start_date_passed"\)\{\n        if\(showStartPassedPopup\("resume", payResumeContext\(r\)\.ctx, error\.result\?\.earliestStart\)\) return;/);
  assert.match(source, /if\(!gate\.pass && gate\.mode === "cutoff"\) return true;/, 'opening the page is not a "queue full"');
  assert.match(source, /const saved = await savePayResumeChanges\("dates", \{onQueueBlocked:message => showShiftQueueFull\(plan, message\)\}\);/);
  for (const text of ['เลยเวลาจัดส่งของวันนี้แล้ว', 'หากยังสนใจเช่า ทางร้านจะเริ่มเช่าเป็นวันพรุ่งนี้แทน (${date})', '"รับทราบ"', '"เปลี่ยนเป็นวันพรุ่งนี้"',
    "Today's delivery time has passed", "If you'd still like to rent, AJ will start your rental tomorrow instead (${date}).", '"OK"', '"Change to tomorrow"',
    '"ชำระเงินต่อ"', '"Continue to payment"']) {
    assert.ok(source.includes(text), text);
  }
});
