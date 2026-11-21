import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Special rental rates (14/11/2026): a private one-time link opens the normal
// booking page with the campaign's devices, the normal price plus the
// campaign's surcharge and no discounts.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../special/index.html', import.meta.url), 'utf8');

test('the /special/ link opens the booking page in special mode and keeps the token out of the address bar', () => {
  assert.match(entry, /\/\^\[A-Za-z0-9_-\]\{10,80\}\$\/\.test\(token\)/);
  assert.match(entry, /location\.replace\(next\)/);
  assert.match(entry, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /const fromUrl = String\(PAGE_PARAMS\.get\("special"\) \|\| ""\)\.trim\(\);/);
  assert.match(html, /clean\.searchParams\.delete\("special"\);/);
  assert.match(html, /sessionStorage\.setItem\(SPECIAL_TOKEN_KEY, specialRate\.token\)/, 'for this tab only');
  assert.doesNotMatch(html, /href="\/special\//, 'the main page never links to it');
});

test('only the campaign’s devices, priced with the surcharge, TH/EN', () => {
  assert.match(html, /\.filter\(c => !special \|\| special\.consoleIds\.map\(String\)\.includes\(String\(c\.id\)\)\)/);
  assert.match(html, /`\$\{money\(Number\(consoleItem\.rate\) \+ Number\(special\.amount \|\| 0\)\)\}\/\$\{tr\("day"\)\}`/);
  assert.match(html, /\? \(en \? `Normal rental \+ \$\{money\(special\.amount\)\} per rental` : `ค่าเช่าปกติ \+ \$\{money\(special\.amount\)\} ต่อการเช่า`\)/);
  assert.match(html, /: \(en \? `Normal rental \+ \$\{money\(special\.amount\)\} per day` : `ค่าเช่าปกติ \+ \$\{money\(special\.amount\)\} ต่อวัน`\)/);
});

test('no discount of any kind at a special rate', () => {
  assert.match(html, /const afterWorkPromo = special \? \{discount:0, eligible:false\} : afterWorkPromotion/);
  assert.match(html, /const retDisc = !special && state\.calc\.ret/);
  assert.match(html, /const reviewGoogleDisc = !special && state\.calc\.ret/);
  assert.match(html, /const promoDisc = special \? 0 : promoDiscount/);
  assert.match(html, /const vip = special \? null : activeVip\(\);/);
  assert.match(html, /vip:null, vipRateApplied:false, vipDepositApplied:false/);
  assert.match(html, /if\(payResume\.active \|\| activeSpecial\(\)\) return "";/, 'the review boxes are not offered');
  assert.match(html, /\$\{payResume\.active \|\| activeSpecial\(\) \? "" : `<label class="option-row demo-reward-row"><input type="checkbox" id="demoReturningOpt"/);
});

test('the surcharge is its own marked line, and the server is given the link to check', () => {
  assert.match(html, /if\(s\.specialSurcharge\) costs\.push\(\{label: s\.specialLabel, value: money\(s\.specialSurcharge\), special:true\}\);/);
  assert.match(html, /\{specialToken:specialRate\.token, specialHolderId:bookingHoldHolderId\(\)\}/);
  assert.match(html, /\.\.\.\(specialModeOn\(\) && specialRate\.campaign \? \{specialToken:specialRate\.token\} : \{\}\)/, 'the 30-minute hold takes a campaign unit');
  assert.match(html, /"ยอดค่าเช่า": Math\.max\(0, Number\(summary\.regularRental\|\|0\) \+ Number\(summary\.specialSurcharge\|\|0\)/);
});

test('every refusal is explained in Thai and English', () => {
  for (const code of ['special_link_invalid', 'special_link_expired', 'special_link_used', 'special_link_revoked', 'special_campaign_closed', 'special_full', 'special_device_not_in_campaign', 'special_no_discounts', 'special_surcharge_mismatch', 'special_amount_mismatch']) {
    assert.match(html, new RegExp(`${code}: en \\? "[^"]+" : "[^"]+"`), code);
  }
});

test('the admin page manages campaigns and one-time links', () => {
  assert.match(html, /special: en \? "Special rates" : "ราคาพิเศษ"/);
  for (const path of ['/api/admin/special-rates?_ts=', '/api/admin/special-rates/campaigns', '/api/admin/special-rates/links', '/revoke']) assert.ok(html.includes(path), path);
  for (const field of ['titleTh', 'titleEn', 'units', 'mode', 'amount', 'linkHours', 'enabled']) assert.ok(html.includes(`data-sp="\${index}:${field}"`), field);
  assert.match(html, /<option value="per_day"[^>]*>\$\{en \? "Per day" : "บวกต่อวัน"\}<\/option><option value="per_rental"/);
});

test('a special rate never checks the stock queue (15/11/2026): every date free, no promotion badge', () => {
  assert.match(html, /if\(activeSpecial\(\)\) return \{mode:"ok",pass:true,message:tr\("available"\)\};/);
  assert.match(html, /if\(activeSpecial\(\)\) return \{cls:"available", note:calendarCellText\("available"\)\};/);
  assert.match(html, /if\(activeSpecial\(\)\) return true;\n    if\(!hasRecentAvailabilitySnapshot\(\)\) return false;/);
  assert.match(html, /if\(activeSpecial\(\)\) return hold;\n    const refreshed = await fetchAvailability\(true\);/);
  assert.match(html, /if\(special && \(special\.consoleIds \|\| \[\]\)\.map\(String\)\.includes\(String\(item\?\.id\)\)\) return !isQueueClosed\(item\);/);
  assert.match(html, /if\(typeof activeSpecial === "function" && activeSpecial\(\)\) return \{eligible:false, discount:0, price:0\};/);
});

test('the admin tab keeps its own unsaved edits: ticking one device never ticks them all', () => {
  assert.match(html, /const ADMIN_OWN_DRAFT_PANELS = new Set\(\["adminTerms", "adminVip", "adminPricing", "adminFaq", "adminSpecial"\]\);/);
  assert.match(html, /if\(specialDraftDirty && byId\("adminSpecial"\)\?\.querySelector\("\[data-sp\]"\)\) adminSpecial\.campaigns = readAdminSpecialCampaigns\(\);/);
});

test('the special page is its own page (15/11/2026): no Before rent button, no "no other discounts" line', () => {
  assert.match(html, /const back = byId\("beforeRentBack"\);\n    if\(back\) back\.hidden = specialModeOn\(\) && !payResume\.active;/);
  assert.match(html, /\.before-rent-back\[hidden\]\{display:none!important\}/, 'the .btn display never shows it again');
  assert.match(html, /<div class="special-rate-rule">\$\{esc\(specialRuleText\(\)\)\}<\/div>/);
  assert.doesNotMatch(html, /no other discounts|ไม่ร่วมกับส่วนลดอื่น/);
});

test('the price row names the campaign and its rate (15/11/2026), never the word "rental" in English', () => {
  assert.match(html, /function specialSurchargeLabel\(special = activeSpecial\(\), days = selectedDays\(\)\)\{/);
  assert.match(html, /`\+\$\{money\(amount\)\}\/วัน × \$\{n\} วัน`/);
  assert.match(html, /`\+\$\{money\(amount\)\} once per booking`/);
  assert.match(html, /specialLabel:special\?specialSurchargeLabel\(special, days\):""/);
});

test('locked dates (16/11/2026): the campaign can fix the start day, the number of days, both or neither', () => {
  // The return day is the start plus the days, as the calendar counts them.
  assert.match(html, /return \{start, days, min, end:start && days && !min \? fmtIso\(addDays\(parseDate\(start\), days\)\) : "", from, any:!!\(start \|\| days \|\| from\)\};/);
  // Days exact or at least (owner, 16/11/2026): a minimum is the calendar's shortest rental.
  assert.match(html, /const min = !!days && special\?\.lockDaysMode === "min";/);
  assert.match(html, /if\(lock\.days && \(lock\.min \? !\(days >= lock\.days\) : days !== lock\.days\)\) return false;/);
  assert.match(html, /diffDays\(start,date\) < calendarMinDays\(dateLock\)/);
  assert.match(html, /`เช่าขั้นต่ำ \$\{lock\.days\} วัน · เลือกวันเริ่มและวันคืนได้`/);
  // The page fills in the locked dates as soon as the campaign loads.
  assert.match(html, /\/\/ Locked dates are filled in for the customer \(and cannot be changed\)\.\n\s+applySpecialDateLock\(\);/);
  // The calendar opens on them; nothing else can be picked, and OK needs them.
  assert.match(html, /if\(state\.calendar\.mode === "end" && !state\.calendar\.draftStart\) state\.calendar\.mode = "start";\n\s+lockCalendarDraft\(\);/);
  assert.match(html, /const lockedOut = dateLock\.any && !calendarLockAllows\(dateLock, date\);/);
  assert.match(html, /\$\{disabled \|\| lockedOut\?"disabled":""\}/);
  assert.match(html, /if\(!calendarLockAllows\(dateLock, picked\)\) return;/);
  assert.match(html, /if\(!specialDatesOk\(state\.calendar\.draftStart, state\.calendar\.draftEnd\)\) return;/);
  assert.match(html, /apply\.disabled = !\(Number\.isFinite\(days\) && days >= 3 && rangeAvailable && specialDatesOk\(/);
  // Told on the page and in the calendar, TH and EN; a passed start closes the page.
  assert.match(html, /`วันเช่าที่กำหนด: เริ่ม \$\{specialLockDate\(lock\.start\)\} · คืน \$\{specialLockDate\(lock\.end\)\} \(\$\{lock\.days\} วัน\)`/);
  assert.match(html, /`Fixed dates: start \$\{specialLockDate\(lock\.start\)\} · return \$\{specialLockDate\(lock\.end\)\} \(\$\{lock\.days\} days\)`/);
  assert.match(html, /if\(specialLockStartPassed\(\)\)\{\n\s+host\.innerHTML = `<div class="special-rate-banner is-error"/);
  for (const code of ['special_dates_locked', 'special_dates_passed']) assert.match(html, new RegExp(`${code}: en \\? "[^"]+" : "[^"]+"`), code);
});

test('the admin page sets the lock and shows the return day it gives', () => {
  for (const field of ['lockStart', 'lockDays', 'lockDaysMode']) assert.ok(html.includes(`data-sp="\${index}:${field}"`), field);
  assert.match(html, /lockDays: field\("lockDays"\)\.value\.trim\(\) === "" \? 0 : Number\(field\("lockDays"\)\.value\),/, 'empty = not locked');
  assert.match(html, /`📅 ลูกค้าจะเช่า \$\{day\(start\)\} → คืน \$\{day\(end\)\} \(\$\{days\} วัน\) ปฏิทินเลือกให้อัตโนมัติ ลูกค้าเลือกวันอื่นไม่ได้`/);
  assert.match(html, /\{ specialDraftDirty = true; refreshAdminSpecialLockPreview\(event\.target\); \}/, 'the sentence follows the typing');
  for (const code of ['special_campaign_lock_start_invalid', 'special_campaign_lock_days_invalid']) assert.match(html, new RegExp(`${code}: en \\? "[^"]+" : "[^"]+"`), code);
});

test('a date lock can be cleared on a phone, whose date picker cannot empty the field (16/11/2026)', () => {
  assert.match(html, /data-sp-lock-clear="\$\{index\}:start"/);
  assert.match(html, /data-sp-lock-clear="\$\{index\}:all"/);
  assert.match(html, /#adminSpecial \[data-sp-revoke\],[^"]*#adminSpecial \[data-sp-lock-clear\]"\)\)\{/, 'the click reaches the handler');
  assert.match(html, /if\(field\("lockStart"\)\) field\("lockStart"\)\.value = "";/);
  assert.match(html, /if\(field\("lockDays"\)\) field\("lockDays"\)\.value = "";/);
});

test('an earliest start day (17/11/2026): only that day or later can be picked, when the start is not locked', () => {
  assert.match(html, /const from = !start && \/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/\.test\(rawFrom\) && parseDate\(rawFrom\) \? rawFrom : "";/);
  assert.match(html, /if\(lock\.from && fmtIso\(date\) < lock\.from\) return false;/, 'earlier days cannot be picked');
  assert.match(html, /if\(lock\.from && !\(String\(startValue \|\| ""\) >= lock\.from\)\) return false;/, 'and OK needs it');
  assert.match(html, /if\(dateLock\.from && !calendarLockAllows\(dateLock, picked\)\) return;/);
  assert.match(html, /\|\| parseDate\(specialFirstStartIso\(\)\);/, 'the calendar opens on that month');
  assert.match(html, /`เลือกวันเริ่มได้ตั้งแต่ \$\{specialLockDate\(lock\.from\)\} เป็นต้นไป`/);
  assert.match(html, /`Start from \$\{specialLockDate\(lock\.from\)\} onwards`/);
  assert.ok(html.includes('data-sp="${index}:startFrom"'));
  assert.ok(html.includes('data-sp-lock-clear="${index}:from"'));
  assert.match(html, /special_campaign_start_from_invalid: en \? "(?:[^"\\]|\\.)+" : "(?:[^"\\]|\\.)+"/);
});

test('the calendar never opens without a console (17/11/2026): the customer is taken to the console box', () => {
  assert.match(html, /if\(!options\.fromOrder && !consoleById\(state\.calc\.consoleId\)\)\{\n\s+promptChooseConsoleFirst\(\);\n\s+return;\n\s+\}/);
  assert.match(html, /chooseConsoleFirst:"เลือกเครื่องเกมก่อน แล้วปฏิทินจะแสดงวันว่างของเครื่องนั้น"/);
  assert.match(html, /chooseConsoleFirst:"Choose a console first\. The calendar then shows its free dates\."/);
  assert.match(html, /data-cal-choose-console>/);
});

// 21/11/2026: the customer went out to LINE and came back in another tab: the
// special rate was gone and the full PS5 queue refused the dates.
test('the special link survives another tab (until it expires) and the LINE round trip; a finished one is dropped quietly', () => {
  assert.match(html, /localStorage\.setItem\(SPECIAL_TOKEN_DEVICE_KEY, JSON\.stringify\(\{token, until\}\)\);/);
  assert.match(html, /Number\(saved\.until\) > Date\.now\(\)\) return String\(saved\.token\);/);
  assert.match(html, /rememberSpecialToken\(specialRate\.token, specialRate\.expiresAt\);/);
  assert.match(html, /\}else if\(specialRate\.fromStorage && \["special_link_used", "special_link_expired"/);
  assert.match(html, /specialToken:specialRate\.token \|\| ""/);
  assert.match(html, /if\(SPECIAL_TOKEN_PATTERN\.test\(String\(draft\.specialToken \|\| ""\)\) && draft\.specialToken !== specialRate\.token\)\{/);
  assert.match(html, /forgetSpecialToken\(\);\n    location\.href = "\/";/);
});
