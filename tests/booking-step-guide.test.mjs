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
  assert.match(source, /<details class="prep-time-detail" data-i18n-html="preparationDetail"><\/details>/);
  assert.match(source, /กรณีต้องดาวน์โหลดหรือติดตั้งเกมเพิ่มเติม: ประมาณ 2–3 ชั่วโมง/);
  assert.match(source, /If additional games need to be downloaded or installed: approximately 2–3 hours/);
  assert.match(source, /rentalTermsVersion !== "2026-09-02"/);
  assert.match(source, /const RENTAL_TERMS_VERSION = "2026-09-02"/);
});

test('booking details hide duplicate returning banner and keep the verified agreement status', () => {
  const optionRows = source.match(/byId\("optionRows"\)\.innerHTML = `([\s\S]*?)`;\n  }/)?.[1] || '';
  assert.doesNotMatch(optionRows, /returningVerifiedHtml/);
  assert.match(optionRows, /agreementActionHtml/);
});

test('Thai cash-on-delivery wording distinguishes the section title from the payment choice', () => {
  assert.match(source, /ชำระปลายทาง \(มีโอนจองคิวก่อน ฿200\)/);
  assert.match(source, /โอนจองคิว ฿200 และชำระยอดที่เหลือปลายทาง/);
});

test('board-game bundle is hidden by default and configurable from Admin', () => {
  assert.match(source, /boardGameEnabled: false/);
  assert.match(source, /if\(!state\.boardGameEnabled\) return "";/);
  assert.match(source, /id="setBoardGame"/);
  assert.match(source, /boardGameEnabled: state\.boardGameEnabled/);
});

test('disabled share actions explain how to recover without affecting cooldown locks', () => {
  assert.match(source, /!canSend && !shareLocked/);
  assert.match(source, /กรุณาตรวจสอบวันที่เช่าและรายละเอียดอื่นอีกครั้ง/);
  assert.match(source, /If the buttons remain unavailable, contact AJ in the chat/);
});

test('Next buttons return the customer to the step tabs at the top', () => {
  assert.match(source, /goCalcStep\(stepGo\.dataset\.stepGo, \{scrollTabs:true\}\)/);
  assert.match(source, /byId\("calcTabs"\)\?\.scrollIntoView\(\{behavior:"smooth", block:"start"\}\)/);
});
