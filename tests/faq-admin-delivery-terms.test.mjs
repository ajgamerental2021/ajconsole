import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('FAQ normalization preserves admin-edited answers instead of replacing them', () => {
  assert.doesNotMatch(source, /normalized\[timeIndex\] = \{\.\.\.DELIVERY_FAQS\.time\}/);
  assert.doesNotMatch(source, /normalized\[deliveryMethodIndex\] =/);
  assert.doesNotMatch(source, /normalized\[deliveryFeeIndex\] =/);
  assert.match(source, /kind: String\(x\.kind \|\| ""\)\.trim\(\)/);
});

test('delivery and no-contract FAQs are bilingual and inserted contextually', () => {
  assert.match(source, /qTh:"ส่งเครื่องและคืนเครื่องอย่างไร"/);
  assert.match(source, /AJ arranges the driver for both delivery and return/);
  assert.match(source, /qTh:"ไม่ทำสัญญาการเช่าได้ไหม\?"/);
  assert.match(source, /deposit increases from ฿2,000 → ฿5,000 or ฿4,000 → ฿8,000/);
  assert.match(source, /deliveryMethodIndex >= 0 \? deliveryMethodIndex \+ 1/);
  assert.match(source, /safeContractIndex >= 0 \? safeContractIndex/);
});

test('FAQ Rental Terms action opens read-only with only a close action', () => {
  assert.match(source, /data-faq-rental-terms/);
  assert.match(source, /function openRentalTermsReadOnly\(\)/);
  assert.match(source, /style\.display = readOnly \? "none" : "flex"/);
  assert.match(source, /byId\("rentalTermsConfirm"\)\.style\.display = readOnly \? "none"/);
  assert.match(source, /readOnly \? \(state\.lang === "en" \? "Close" : "ปิด"\)/);
});

test('rental guide explains that AJ arranges both delivery and return drivers', () => {
  assert.match(source, /ทางร้านเป็นฝ่ายเรียกรถให้ทั้งขาส่งไปและขารับคืนเครื่อง/);
  assert.match(source, /AJ arranges the driver for both delivery and return/);
});
