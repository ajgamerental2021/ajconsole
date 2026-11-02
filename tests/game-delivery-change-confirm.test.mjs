import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const picker = fs.readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const submit = picker.slice(picker.indexOf('async function submitSelectionToken()'), picker.indexOf('function isContractCardGamePicker()'));
const confirm = picker.slice(picker.indexOf('function confirmDeliveryChange(change)'), picker.indexOf('async function pickPrimaryAction()'));

test("a list that moves today's delivery is confirmed (or cancelled) before it is sent", () => {
  assert.ok(submit.indexOf('await deliveryChangeForGames()') < submit.indexOf('/api/game-selection/submit/'), 'asked before sending');
  assert.match(submit, /if \(change && !\(await confirmDeliveryChange\(change\)\)\) \{/);
  assert.match(picker, /\/api\/game-selection\/delivery-preview\//);
});

test('the popup says when installing starts, how long it takes, the new time and that it is fixed — Thai and English', () => {
  assert.match(confirm, /ร้านจะเริ่มเตรียมและติดตั้งเกมเมื่อร้านเปิด 10:00 น\. ใช้เวลาประมาณ 2–3 ชั่วโมง/);
  assert.match(confirm, /when the shop opens at 10:00\. It takes about 2–3 hours/);
  assert.match(confirm, /เวลาส่งเครื่องวันนี้จะเปลี่ยนจาก \$\{change\.from \|\| '-'\} เป็นประมาณ \$\{change\.to\} น\. และแก้ไขเวลาส่งไม่ได้หลังยืนยัน/);
  assert.match(confirm, /the delivery time can no longer be changed/);
  assert.match(confirm, /ยืนยันส่งรายการเกม/);
  assert.match(confirm, /'ยกเลิก'/);
});
