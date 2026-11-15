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
