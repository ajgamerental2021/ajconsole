import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// iPhone: the booking signature pad inks on the first stroke, without the page
// having to be scrolled or the pad cleared first (08/11/2026).
test('booking signature pad takes fingers through non-passive Touch Events', () => {
  const pad = html.slice(html.indexOf('demoAgreement.clearSignaturePad'), html.indexOf('demoAgreement.clearSignaturePad') + 4000);
  assert.match(pad, /canvas\.addEventListener\("touchstart", [^\n]*event\.preventDefault\(\); \},\{passive:false\}\);/);
  assert.match(pad, /canvas\.addEventListener\("touchmove", [^\n]*event\.preventDefault\(\); \},\{passive:false\}\);/);
  assert.match(pad, /canvas\.addEventListener\("touchcancel", finish\);/);
  // Touch Events are wired whether or not the browser has Pointer Events, and
  // the pointer handlers leave fingers to them.
  assert.ok(pad.indexOf('"touchstart"') < pad.indexOf('if(window.PointerEvent)'));
  assert.match(pad, /pointerdown", event => \{\n\s*if\(event\.pointerType === "touch"\) return;/);
  assert.match(pad, /pointermove", event => \{ if\(event\.pointerType !== "touch" && current\)/);
});
