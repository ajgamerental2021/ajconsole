import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('after connecting LINE, booking asks for one tap on "add friend" before it can go on', () => {
  assert.match(page, /const LINE_FRIEND_URL = "https:\/\/lin\.ee\/9CIG3uzq";/);
  assert.match(page, /if\(!payResume\.active && bookingLineConnection\(\) && !lineFriendExempt\(\)\) need\("lineFriendBtn", lineFriendClicked\(\), tr\("lineFriendRequired"\)\);/);
  assert.match(page, /\$\{bookingLineConnection\(\) && !lineFriendExempt\(\) \? lineFriendStepHtml\(\) : ""\}/, 'the button sits under the LINE connection');
  assert.match(page, /return !!saved && !!connection && saved.userId === connection.userId;/, 'remembered per LINE account');
});

test('the pop-up after connecting: one green button and a close button, only on the booking step', () => {
  const gate = page.match(/<div class="line-friend-modal" id="lineFriendGate"[\s\S]*?<\/div>\n<\/div>/)[0];
  assert.match(gate, /id="lineFriendGateAdd" href="https:\/\/lin\.ee\/9CIG3uzq"/);
  assert.match(gate, /id="lineFriendGateClose"/, 'a close button');
  assert.match(page, /if\(targetId === "lineFriendGateClose"\)\{ closeLineFriendGate\(\); return; \}/, 'closing is not counted as added');
  assert.match(page, /if\(!payResume\.active && !lineFriendClicked\(\)\) void openLineFriendGateAfterReturningCheck\(\);/);
  assert.match(page, /if\(state\.beforeRentActive \|\| state\.calc\.step !== 2\) return;/, 'never over the home page');
  assert.match(page, /closeLineFriendGate\(\);\n      render\(\);\n      focusDemoCustomerName\(\);/, 'straight on to the name box');
  assert.ok(!page.includes('ร้านจะส่งข้อมูลการเช่าให้ทาง LINE หลังชำระเงิน'), 'the rental-details sentence is gone');
});

test('one Admin switch turns off both pop-ups; an unreadable setting shows none', () => {
  assert.match(page, /return setting\?\.enabled === true;/);
  assert.match(page, /if\(!\(await lineFriendPopupsAllowed\(\)\)\) return;/);
  assert.match(page, /lineFriendExempt\(\) \|\| lineFriendPromoSetting\?\.enabled !== true\) return;/, 'the gate checks the switch too');
});

test('add-friend wording in Thai and English', () => {
  for (const text of ['เพิ่มเพื่อนเพื่อรับข้อมูลการเช่า', 'กลับมาที่หน้านี้เพื่อทำรายการเช่าต่อ', 'Add us as a friend to get your rental details', 'come back to this page to finish your booking',
    'เพิ่มเพื่อน AJ เช่าเครื่องเกม ทาง LINE', 'รับข้อมูลข่าวสารและโปรโมชั่น', 'Add AJ Game Rental on LINE', 'Get our news and promotions']) assert.ok(page.includes(text), text);
});

test('the site invitation shows at most once a day, can be switched off in Admin, and never during the add-friend step', () => {
  assert.match(page, /const LINE_FRIEND_PROMO_DAY_KEY = "aj_line_friend_promo_day_v1";/);
  assert.match(page, /return localStorage\.getItem\(LINE_FRIEND_PROMO_DAY_KEY\) === bangkokDay\(\);/);
  assert.match(page, /\/api\/site-content\/line-friend-popup/);
  assert.match(page, /\/api\/admin\/site-content\/line-friend-popup/);
  assert.match(page, /lineFriendPromoSetting = \{enabled: result\?\.content\?\.enabled !== false\};/, 'on until the shop switches it off');
  assert.match(page, /\|\| !state\.beforeRentActive;/, 'only on the page before booking');
  assert.match(page, /lineFriendGateShown \|\| lineFriendPromoSeenToday\(\)/);
  assert.doesNotMatch(page.slice(page.indexOf('async function maybeShowLineFriendPromo'), page.indexOf('function lineFriendPromoSeenToday')), /state\.adminToken/, 'a signed-in admin still sees it once Admin is closed');
  assert.match(page, /waited < 600/, 'waits for the announcement to be closed');
  assert.match(page, /id="adminAnnouncement">\$\{adminAnnouncementHtml\(\)\}\$\{adminLineFriendPromoHtml\(\)\}/);
});

test('Thai customers who have rented before are never asked to add the shop; English keeps the button', () => {
  assert.match(page, /return state\.lang === "th" && knownReturningCustomer\(\);/);
  assert.match(page, /\$\{bookingLineConnection\(\) && !lineFriendExempt\(\) \? lineFriendStepHtml\(\) : ""\}/);
  assert.match(page, /bookingLineConnection\(\) && !lineFriendExempt\(\)\) need\("lineFriendBtn"/);
  assert.match(page, /if\(lineFriendClicked\(\) \|\| !bookingLineConnection\(\) \|\| lineFriendExempt\(\) \|\|/);
  assert.match(page, /await settleReturningCheck\(3000\);/, 'the site pop-up waits briefly for the returning check');
  assert.match(page, /if\(state\.calc\.retVerified\) rememberReturningCustomer\(\);/, 'a verified returning customer is remembered on the device');
  assert.match(page, /if\(eligible\)\{\n          rememberReturningCustomer\(\);/, 'and so is one found by LINE in the rental history');
  assert.doesNotMatch(page.slice(page.indexOf('function knownReturningCustomer'), page.indexOf('function lineFriendExempt')), /activeLineConnection|bookingLineConnection/, 'a LINE connection alone is not a returning customer');
});

test('a LINE SDK tag that failed to load does not hang later LINE checks', () => {
  assert.match(page, /if\(old && old\.dataset\.lineLiffState !== "failed"\)/);
  assert.match(page, /s\.onerror = error => \{ s\.dataset\.lineLiffState = "failed"; reject\(error\); \};/);
});
