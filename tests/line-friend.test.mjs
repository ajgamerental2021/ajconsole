import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('after connecting LINE, booking asks for one tap on "add friend" before it can go on', () => {
  assert.match(page, /const LINE_FRIEND_URL = "https:\/\/lin\.ee\/9CIG3uzq";/);
  assert.match(page, /if\(!payResume\.active && bookingLineConnection\(\)\) need\("lineFriendBtn", lineFriendClicked\(\), tr\("lineFriendRequired"\)\);/);
  assert.match(page, /\$\{bookingLineConnection\(\) \? lineFriendStepHtml\(\) : ""\}/, 'the button sits under the LINE connection');
  assert.match(page, /return !!saved && !!connection && saved.userId === connection.userId;/, 'remembered per LINE account');
});

test('the pop-up after connecting has one green button and no way to close it otherwise', () => {
  const gate = page.match(/<div class="line-friend-modal" id="lineFriendGate"[\s\S]*?<\/div>\n<\/div>/)[0];
  assert.match(gate, /id="lineFriendGateAdd" href="https:\/\/lin\.ee\/9CIG3uzq"/);
  assert.doesNotMatch(gate, /<button/, 'no cancel or close button');
  assert.match(page, /if\(!payResume\.active && !lineFriendClicked\(\)\) window\.setTimeout\(openLineFriendGate, 250\);/);
  assert.match(page, /closeLineFriendGate\(\);\n      render\(\);\n      focusDemoCustomerName\(\);/, 'straight on to the name box');
});

test('add-friend wording in Thai and English', () => {
  for (const text of ['เพิ่มเพื่อนเพื่อรับข้อมูลการเช่า', 'กลับมาที่หน้านี้เพื่อทำรายการเช่าต่อ', 'Add us as a friend to get your rental details', 'come back to this page to finish your booking',
    'เพิ่มเพื่อน AJ เช่าเครื่องเกม ทาง LINE', 'รับข้อมูลข่าวสารและโปรโมชั่น', 'Add AJ Game Rental on LINE', 'Get our news and promotions']) assert.ok(page.includes(text), text);
});

test('the site invitation shows at most once a day, can be switched off in Admin, and never during the add-friend step', () => {
  assert.match(page, /const LINE_FRIEND_PROMO_DAY_KEY = "aj_line_friend_promo_day_v1";/);
  assert.match(page, /if\(seenDay === bangkokDay\(\)\) return;/);
  assert.match(page, /\/api\/site-content\/line-friend-popup/);
  assert.match(page, /\/api\/admin\/site-content\/line-friend-popup/);
  assert.match(page, /lineFriendPromoSetting = \{enabled: result\?\.content\?\.enabled !== false\};/, 'on until the shop switches it off');
  assert.match(page, /lineFriendEverClicked\(\) \|\| lineFriendGateShown/);
  assert.match(page, /id="adminAnnouncement">\$\{adminAnnouncementHtml\(\)\}\$\{adminLineFriendPromoHtml\(\)\}/);
});
