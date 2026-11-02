import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 02/11/2026: "เช่าเลย / จองล่วงหน้า" could be pressed again while the first
// request was still running — another offer's button, or the same one after
// the list redrew. One request at a time, page-wide, until the popup shows.
for (const file of ['../ajgameid/index.html', '../ajgameid/switch/index.html']) {
  const html = readFileSync(new URL(file, import.meta.url), 'utf8');
  test(`${file}: one rent/reserve at a time until the popup, Thai and English`, () => {
    const handler = html.slice(html.indexOf('async function handleLineShare('), html.indexOf('function renderCard(item)'));
    assert.match(handler, /^async function handleLineShare\(button, itemId, offerIndex\) \{\n      if \(shareInFlight\) return false;/);
    assert.match(handler, /shareInFlight = \{ key: `\$\{itemId\}:\$\{offerIndex\}` \};\n      setShareButtonsBusy\(true\);/);
    assert.ok(handler.indexOf('showCopyModal(') < handler.indexOf('finally {'), 'released only after the popup');
    assert.match(handler, /finally \{\n        restoreShareButton\(button, originalLabel\);/);
    assert.match(html, /function setShareButtonsBusy\(busy\) \{[\s\S]*?querySelectorAll\('button\[data-share-offer\]'\)[\s\S]*?btn\.disabled = busy;/);
    // A redraw while busy keeps every button off and the pressed one's label.
    assert.match(html, /data-share-offer="\$\{item\.idNo\}:\$\{offerIndex\}"[^>]*\$\{shareInFlight \? ' disabled' : ''\}/);
    assert.match(html, /preparing: 'กำลังดำเนินการ… รอสักครู่'/);
    assert.match(html, /preparing: 'Processing… please wait'/);
    for (const key of ['shareItemMissing', 'shareFailed']) assert.equal((html.match(new RegExp(`${key}: '`, 'g')) || []).length, 2, key);
    assert.doesNotMatch(handler, /alert\('[ก-๙]/, 'no Thai-only alerts');
  });
}
