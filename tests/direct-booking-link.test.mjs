import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('booking=1 points directly at the calculator heading without removing or hiding the back button', () => {
  assert.match(source, /id="beforeRentBack"/);
  assert.doesNotMatch(source, /direct-booking-entry #beforeRentBack/);
  assert.match(source, /class="calc-head-wrap" id="calcHeading"/);
  assert.match(source, /#calcHeading\{scroll-margin-top:calc\(var\(--nav-h\) \+ 8px\)\}/);
  assert.match(source, /get\("booking"\) === "1"/);
  assert.match(source, /if\(directBookingEntry\) state\.calc\.step = 1/);
  assert.match(source, /else if\(!openedFromLink && directBookingEntry\)\{[\s\S]*byId\("calcHeading"\)\.scrollIntoView\(\{block:"start"\}\)/);
});

test('the direct booking URL is treated as calculator context in both languages', () => {
  assert.match(source, /const contextKeys = \[[^\]]*"booking"\]/);
  assert.match(source, /if\(\["th","en"\]\.includes\(requestedLanguage\)\) state\.lang = requestedLanguage/);
});
