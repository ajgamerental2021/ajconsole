import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('booking=1 opens the calculator directly without removing the normal back button', () => {
  assert.match(source, /id="beforeRentBack"/);
  assert.match(source, /body\.direct-booking-entry #beforeRentBack\{display:none\}/);
  assert.match(source, /get\("booking"\) === "1"/);
  assert.match(source, /document\.body\.classList\.toggle\("direct-booking-entry", directBookingEntry\)/);
  assert.match(source, /if\(directBookingEntry\) state\.calc\.step = 1/);
  assert.match(source, /pageParams\.get\("go"\) === "calc" \|\| directBookingEntry/);
});

test('the direct booking URL is treated as calculator context in both languages', () => {
  assert.match(source, /const contextKeys = \[[^\]]*"booking"\]/);
  assert.match(source, /if\(\["th","en"\]\.includes\(requestedLanguage\)\) state\.lang = requestedLanguage/);
});
