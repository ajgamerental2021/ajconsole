import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('all booking-detail guide stages remain on step 2', () => {
  assert.match(
    source,
    /if\(\["games","bg","ret","contractChoice","contractLink","payment","maps","next2"\]\.includes\(stage\)\) return 2;/,
  );
  assert.match(source, /if\(\["next3","share"\]\.includes\(stage\)\) return 3;/);
});

test('step 2 advances through payment before review', () => {
  const stepTwo = source.match(/if\(step === 2\)\{([\s\S]*?)\n    \}\n    if\(step === 3\)/)?.[1] || '';
  assert.match(stepTwo, /return "payment"/);
  assert.match(stepTwo, /return "next2"/);
  assert.doesNotMatch(stepTwo, /guideStageForStep\(3\)/);
});

test('preparation timing is shown above the calculator and after game selection in both languages', () => {
  assert.match(source, /class="prep-time-brief" data-i18n="preparationBrief"/);
  assert.match(source, /class="prep-time-detail" data-i18n-html="preparationDetail"/);
  assert.match(source, /กรณีต้องดาวน์โหลดหรือติดตั้งเกมเพิ่มเติม: ประมาณ 2–3 ชั่วโมง/);
  assert.match(source, /If additional games need to be downloaded or installed: approximately 2–3 hours/);
  assert.match(source, /rentalTermsVersion !== "2026-09-02"/);
  assert.match(source, /const RENTAL_TERMS_VERSION = "2026-09-02"/);
});
