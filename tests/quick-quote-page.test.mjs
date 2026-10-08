import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');

test('the quick quote lives on the booking site at /quote/, calling the Bot for the live parts', () => {
  assert.match(page, /var API = 'https:\/\/aj-line-oa-bot\.onrender\.com';/);
  for (const path of ['delivery/quote', 'analytics/event', 'quick-quote']) assert.ok(page.includes(`fetch(API + '/api/${path}'`), path);
  assert.match(page, /<meta name="robots" content="noindex,nofollow">/);
});

test('rental, deposit and the live delivery fee, by the booking site\'s rules, in two languages', () => {
  assert.match(page, /var MONTHLY = \{ 500: 8500, 400: 6500, 350: 5000, 300: 4000 \};/);
  assert.match(page, /title: 'คำนวณค่าเช่า\/ค่าส่ง'/);
  assert.match(page, /title: 'Rental & delivery calculator'/);
  assert.doesNotMatch(page, /api\/availability|booking-holds/, 'no queue check');
});

test('After Work 3 Nights: 3 days from Monday or Tuesday, priced by daily rate', () => {
  assert.match(page, /var AFTER_WORK = \{ 300: 777, 350: 888, 400: 999, 500: 1299 \};/);
  // On the rate the rental is priced on: a bundle's ฿600 has no promo price.
  assert.match(page, /return c && n === 3 \? \(AFTER_WORK\[Number\(termsOf\(c\)\.rate\)\] \|\| 0\) : 0;/);
  assert.match(page, /\[hidden\] \{ display: none !important; \}/);
});

test('accessories by device, PS5 bundles, and the current-location button', () => {
  assert.match(page, /if \(id === SW1_ID\) items = items\.concat\(SW_ROOT, SW_SUB\);/);
  assert.match(page, /data\.rentalAccessories/);
  assert.match(page, /data\.rentalBundles/);
  assert.match(page, /return b \? \{ rate: b\.rate, weekly: b\.weekly, deposit: b\.deposit/);
  assert.match(page, /placeSearch\.locate\(\)\.then\(function \(at\) \{/);
  assert.match(page, /locate: '📍 ใช้ตำแหน่งปัจจุบัน'/);
  assert.match(page, /locate: '📍 Use my current location'/);
});

test('no identity verification: the deposit goes up as on the booking site', () => {
  assert.match(page, /var deposit = noId \? noIdDepositFor\(normalDeposit, !!terms\.bundle, selected\(\)\) : normalDeposit;/);
  assert.match(page, /noIdAsk: 'ไม่ยืนยันตัวตน'/);
  assert.match(page, /noIdAsk: 'No identity verification'/);
});

test('every PS5 bundle without identity verification holds ฿15,000', () => {
  assert.match(page, /function noIdDepositFor\(normal, isBundle, device\)/);
  assert.match(page, /return amount === 2000 && special \? 5000/);
  assert.match(page, /noIdDepositFor\(normalDeposit, !!terms\.bundle, selected\(\)\)/);
});

test('book and LINE buttons, and anonymous events for the analytics page', () => {
  assert.match(page, /https:\/\/ajgamerental\.com\/\?consoleId=/);
  assert.match(page, /https:\/\/line\.me\/R\/oaMessage\/%40ajgame\/\?/);
  for (const event of ['quick_quote_opened', 'quick_quote_calculated', 'quick_quote_book_clicked', 'quick_quote_line_clicked', 'quick_quote_copied', 'quick_quote_delivery_failed']) {
    assert.ok(page.includes(`'${event}'`), event);
  }
  assert.doesNotMatch(page.slice(page.indexOf('function track('), page.indexOf('function quoteText(')), /\$\('maps'\)|mapsUrl|\.phone\b/, 'no map link or phone in the events');
});

test('a Logitech G29, alone or in the PS5 + Logitech G29 bundle, is quoted for a car', () => {
  assert.match(page, /\{ id: 'ps5_g29', th: 'PS5 \+ Logitech G29'/);
  assert.match(page, /var name = \(c\.name \|\| ''\) \+ ' ' \+ \(c\.nameEn \|\| ''\) \+ ' ' \+ \(c\.brand \|\| ''\) \+ ' ' \+ \(b \? b\.th \+ ' ' \+ b\.en : ''\);/);
  assert.match(page, /hasLargeItem: \/G29\|Logitech\/i\.test\(name\)/);
});

test('under the total: the returning and review discounts are named, claimed on booking (TH/EN)', () => {
  assert.match(page, /<div id="rows"><\/div>\n    <p class="perks" data-t="perks"><\/p>/);
  assert.match(page, /perks: '🎁 ลูกค้าเก่าลด 10% · รีวิวลดเพิ่ม — ยืนยันสิทธิได้ตอนกดจอง'/);
  assert.match(page, /perks: '🎁 Returning customers save 10% · reviews save more — claim them when you book'/);
  assert.match(page, /money\(L\.total\), RULE, t\('perks'\)\)/, 'in the copied / LINE text too');
  assert.doesNotMatch(page, /id="returning"|id="review"/, 'no tick boxes: nothing is discounted on this page');
});

test('the page: a code per quote at the end of the LINE message, saved as LINE opens', () => {
  assert.match(page, /'\\n\\n🔖 ' \+ t\('quoteCode'\) \+ ' ' \+ code\);/);
  assert.match(page, /\$\('sendLine'\)\.addEventListener\('click', function \(\) \{ saveForLine\(\);/);
  assert.match(page, /fetch\(API \+ '\/api\/quick-quote', \{ method: 'POST'[^\n]*keepalive: true \}\)/);
  assert.match(page, /var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';/);
});

test('the booking page\'s order: brand, then its own order, then the higher rate', () => {
  assert.match(page, /var BRAND_ORDER = \{ playstation: 1, nintendo: 2, xbox: 3, logitech: 4, meta: 5, viture: 6, xreal: 7, rog: 8, lenovo: 9, steamdeck: 10, other: 99 \};/);
  assert.match(page, /var RANK = \['PS5', 'PS5 Pro', 'PS4', 'PS Portal', 'PS VR2', 'PS FlexStrike Wireless Fight Stick', 'Nintendo Switch 2'/);
  assert.match(page, /rankOf\(a\) - rankOf\(b\) \|\| b\.rate - a\.rate/);
  // Kept identical to the booking page's own list.
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const theirs = index.match(/const order = (\[[^\]]+\]);/)[1];
  const ours = page.match(/var RANK = (\[[^\]]+\])/)[1];
  assert.deepEqual(JSON.parse(ours.replace(/'/g, '"')), JSON.parse(theirs));
});

test('a device not ready yet or with its queue shut is greyed with the reason, and opens by itself (TH/EN)', () => {
  assert.match(page, /readyDate: String\(c\.readyDate \|\| c\.unavailableUntil \|\| ''\)\.trim\(\)/);
  assert.match(page, /fetch\(API \+ '\/api\/queue-closures\?_ts='/);
  assert.match(page, /\(reason \? ' disabled' : ''\)/);
  assert.match(page, /\(reason \? '⛔ ' : ''\) \+ nameOf\(c\) \+ ' \(' \+ money\(c\.rate\)/);
  assert.match(page, /readyOn: 'พร้อมวันที่', queueClosed: 'ปิดคิวในช่วงเวลานี้'/);
  assert.match(page, /readyOn: 'Available from', queueClosed: 'Queue closed during this period'/);
  assert.match(page, /if \(Number\.isFinite\(Date\.parse\(rule\.endAt \|\| ''\)\)\) return false;/, 'a closure with dates does not shut a quote without dates');
  assert.match(page, /\$\('device'\)\.value = still && !unavailableReason\(still\) \? current : '';/);
});

test('a shared link shows what the page is, not "Google Maps"', () => {
  assert.match(page, /<meta property="og:title" content="คำนวณค่าเช่า\/ค่าส่ง · AJ เช่าเครื่องเกม">/);
  assert.match(page, /<meta property="og:description" content="เช็คราคาเช่าเครื่องเกมคร่าวๆ ด้วยตัวเอง/);
  assert.match(page, /<meta name="description" content="เช็คราคาเช่าเครื่องเกมคร่าวๆ/);
  assert.ok(page.includes('og:image" content="https://ajgamerental.com/assets/aj-share-logo.jpg"'));
});

test('"send this price on LINE" goes through AJ\'s LIFF app, which proves the LINE account before the card is sent', () => {
  assert.match(page, /fetch\(API \+ '\/api\/config'/);
  assert.match(page, /'https:\/\/liff\.line\.me\/' \+ liffId \+ '\/\?qq=' \+ encodeURIComponent\(code\) \+ '&lang=' \+ lang/);
  assert.match(page, /id="sendLine" href="#" target="_top"/);
});

test('a device can be chosen for the page: ?device= or a message from the booking page', () => {
  assert.match(page, /var wantedDevice = String\(params\.get\('device'\) \|\| ''\);/);
  assert.match(page, /if \(data\.type === 'AJ_SET_DEVICE'\) chooseDevice\(data\.consoleId\);/);
  assert.match(page, /if \(!option \|\| option\.disabled\) return;/, 'a closed device is not chosen');
  assert.match(page, /renderAddOns\(\);\n      chooseDevice\(wantedDevice\);/);
});
