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
