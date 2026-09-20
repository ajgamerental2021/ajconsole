import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function buildRange(start, end, today) {
  const match = source.match(/function livePickerRentalRange\(\)\{[\s\S]*?\n  \}/);
  assert.ok(match, 'livePickerRentalRange should exist');
  return Function('state', 'todayIso', `${match[0]}; return livePickerRentalRange();`)(
    { calc: { start, end } },
    () => today
  );
}

test('expired picker payload dates are cleared', () => {
  assert.deepEqual(
    buildRange('2026-09-01', '2026-09-10', '2026-09-20'),
    { startDate: '', endDate: '' }
  );
});

test('future picker payload dates pass through', () => {
  assert.deepEqual(
    buildRange('2026-09-21', '2026-09-24', '2026-09-20'),
    { startDate: '2026-09-21', endDate: '2026-09-24' }
  );
});

test('all picker entry points use the guarded rental range', () => {
  assert.match(source, /new URLSearchParams\(\{[^}]*startDate:rentalRange\.startDate, endDate:rentalRange\.endDate/);
  assert.equal((source.match(/startDate:rentalRange\.startDate/g) || []).length, 3);
  assert.equal((source.match(/endDate:rentalRange\.endDate/g) || []).length, 3);
});
