import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('checking or clearing returning customer stays on booking details', () => {
  const handler = source.match(/if\(event\.target\.id === "retOpt" \|\| event\.target\.id === "demoReturningOpt"\)\{([\s\S]*?)\n      \}\n      if\(event\.target\.id === "reviewGoogleOpt"\)/)?.[1] || '';

  assert.match(handler, /setGuideStage\(state\.calc\.ret \? "payment" : "contractChoice", \{syncStep:false\}\)/);
  assert.match(handler, /saveLocal\(\);\s*render\(\);/);
  assert.doesNotMatch(handler, /advanceGuide\(/);
  assert.doesNotMatch(handler, /state\.calc\.step\s*=/);
});

test('manual returning-customer proof follows the booking without exposing name or phone', () => {
  assert.match(source, /state\.calc\.retVerificationToken = String\(result\.verificationToken \|\| ""\)/);
  assert.match(source, /returningVerificationToken: state\.calc\.retVerificationMethod === "manual" \? state\.calc\.retVerificationToken : ""/);
  assert.doesNotMatch(source, /state\.calc\.(?:customerName|customerPhone)\s*=\s*result\./);
});
