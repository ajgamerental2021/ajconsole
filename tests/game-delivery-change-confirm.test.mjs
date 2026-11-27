import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const picker = fs.readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
const submit = picker.slice(picker.indexOf('async function submitSelectionToken()'), picker.indexOf('function isContractCardGamePicker()'));
const confirm = picker.slice(picker.indexOf('function confirmDeliveryChange(change)'), picker.indexOf('async function pickPrimaryAction()'));

test("a list that moves today's delivery is confirmed (or cancelled) before it is sent", () => {
  const asked = submit.indexOf('await deliveryChangeForGames(names)');
  assert.ok(asked > 0 && asked < submit.indexOf('/api/game-selection/submit/'), 'asked before sending, with the list');
  // The list goes with the question: one that only drops games moves nothing (27/11/2026).
  assert.match(picker, /body: JSON\.stringify\(\{ games: Array\.isArray\(names\) \? names : \[\] \}\)/);
  assert.match(submit, /if \(change && !\(await confirmDeliveryChange\(change\)\)\) \{/);
  assert.match(picker, /\/api\/game-selection\/delivery-preview\//);
});

test('the popup says when installing starts, how long it takes, the new time and that it is fixed — Thai and English', () => {
  // After hours (27/11/2026): installed from 10:00, about 3 hours; a card follows to confirm or keep the old time.
  assert.match(confirm, /ร้านจะติดตั้งเกมที่เลือกให้เมื่อร้านเปิด 10:00 น\. ใช้เวลาประมาณ 3 ชั่วโมง/);
  assert.match(confirm, /We install the games you chose when the shop opens at 10:00\. It takes about 3 hours\./);
  assert.match(confirm, /เวลาส่งเครื่อง\$\{when\}จึงเปลี่ยนจาก \$\{change\.from \|\| '-'\} น\. เป็น \$\{change\.to\} น\. ร้านจะส่งการ์ดให้กดยืนยันเวลาใหม่ หรือกด "ไม่รับเกมที่อัปเดตและส่งเวลาเดิม" \(กดได้ถึง 10:00 น\. ของวันส่ง\)/);
  assert.match(confirm, /We will send you a card to confirm the new time, or to tap "Skip updated games" and keep \$\{change\.from \|\| 'the original time'\} \(until 10:00 on the day\)\./);
  // While the shop is open, as before.
  assert.match(confirm, /ร้านจะเริ่มเตรียมและติดตั้งเกมทันที ใช้เวลาประมาณ 2–3 ชั่วโมง/);
  assert.match(confirm, /เวลาส่งเครื่องวันนี้จะเปลี่ยนจาก \$\{change\.from \|\| '-'\} เป็นประมาณ \$\{change\.to\} น\. และแก้ไขเวลาส่งไม่ได้หลังยืนยัน/);
  assert.match(confirm, /the delivery time can no longer be changed/);
  assert.match(confirm, /ยืนยันส่งรายการเกม/);
  assert.match(confirm, /'ยกเลิก'/);
});
