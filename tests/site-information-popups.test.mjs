import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('About, Privacy and Rental Terms are available from all required surfaces', () => {
  // Header menu dropdown and the footer; the old link bars on the home and
  // booking sections were folded into the menu.
  assert.equal((html.match(/ data-info-links/g) || []).length, 2);
  assert.match(html, /id="siteMenuBtn" type="button" aria-haspopup="true" aria-expanded="false"/);
  assert.match(html, /id="siteMenuList" role="menu" data-info-links hidden/);
  assert.doesNotMatch(html, /class="page-info-links/);
  for (const page of ['about', 'privacy', 'terms']) {
    assert.match(html, new RegExp(`data-info-page="\\$\\{key\\}"`));
    assert.match(html, new RegExp(`${page}Title:`));
  }
});

test('information popup is bilingual and Terms uses the current server document', () => {
  assert.match(html, /เกี่ยวกับ AJ เช่าเครื่องเกม/);
  assert.match(html, /About AJ Game Rental/);
  assert.match(html, /นโยบายความเป็นส่วนตัว/);
  assert.match(html, /Privacy Policy/);
  assert.match(html, /new URL\("\/rental-terms\/", CONFIG\.apiBase\)/);
  assert.match(html, /url\.searchParams\.set\("embed", "1"\)/);
  assert.match(html, /id="infoModalLang"/);
});

test('privacy notice reflects the current identity-document retention policy', () => {
  assert.match(html, /ไม่เกิน 1 ปีนับจากวันคืนอุปกรณ์/);
  assert.match(html, /ไม่เกิน 1 ปีนับจากวันคืนอุปกรณ์/);
  assert.match(html, /no longer than one year from the return date/);
  assert.match(html, /no longer than one year from the return date/);
});

test('About restores the founding date and model count with the shorter intro', () => {
  assert.match(html, /aboutSubtitle:"ให้บริการเช่าอุปกรณ์เกมแบบจัดส่งในกรุงเทพฯ และปริมณฑล"/);
  assert.match(html, /aboutLead:"AJ เช่าเครื่องเกม ให้บริการเช่าเครื่องเล่นเกม และอุปกรณ์อิเล็กทรอนิกส์แบบรายวัน รายสัปดาห์"/);
  assert.match(html, /<p class="info-modal-facts">\$\{esc\(copy\.aboutSince\)\}<br>\$\{esc\(aboutModelCountText\(\)\)\}<\/p>/);
  assert.match(html, /มีอุปกรณ์ให้บริการเช่ามากกว่า \$\{shown\} รุ่น/);
  assert.match(html, /More than \$\{shown\} models available to rent/);
});

test('admin tabs are named in both languages and edit Privacy and the Rental Terms', () => {
  assert.match(html, /\["queue","pickup","about","privacy","terms","consoles"/);
  for (const label of ['pickup: en ? "Pickup points" : "จุดรับของ"', 'about: en ? "About Us" : "เกี่ยวกับเรา"', 'privacy: en ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"', 'terms: en ? "Terms & Conditions" : "ข้อกำหนดและเงื่อนไข"']) {
    assert.ok(html.includes(label), label);
  }
  assert.match(html, /\/api\/admin\/site-content\/privacy/);
  assert.match(html, /\/api\/admin\/rental-terms/);
  assert.match(html, /richTextHtml\(privacyText\(state\.lang\), \{lead:true\}\)/);
});

test('shop-typed privacy text is escaped before display', () => {
  const start = html.indexOf('  function richInlineHtml(text){');
  const end = html.indexOf('  const privacyOverrides');
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const contactListHtml = () => '<ul>contact</ul>';
  const richTextHtml = new Function('esc', 'contactListHtml', `${html.slice(start, end)}; return richTextHtml;`)(esc, contactListHtml);
  const out = richTextHtml('lead **b**\n## <img src=x onerror=1>\n- a\n[x](javascript:alert(1))\n[contact]', {lead:true});
  assert.match(out, /^<p class="info-modal-lead">lead <strong>b<\/strong><\/p>/);
  assert.match(out, /<h2>&lt;img src=x onerror=1&gt;<\/h2><ul><li>a<\/li><\/ul>/);
  assert.doesNotMatch(out, /href="javascript/);
  assert.match(out, /<ul>contact<\/ul>$/);
});

test('both privacy texts end with the contact block', () => {
  assert.match(html, /## ติดต่อเรื่องข้อมูลส่วนบุคคล\n\[contact\]`,/);
  assert.match(html, /## Privacy contact\n\[contact\]`/);
});
