import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const quote = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');

test('two ways in: the menu, and step 1 beside the rental steps (TH/EN)', () => {
  assert.match(html, /\["quote", "tag", en \? "Rental calculator" : "คำนวณค่าเช่า"\], \["prices"/);
  assert.match(html, /if\(action === "quote"\) openQuotePopup\("menu"\);/);
  assert.match(html, /<button class="btn step-guide-btn" id="quoteBtn" type="button" data-i18n="quoteBtn">🧮 คำนวณค่าเช่า<\/button><button class="btn danger step-guide-btn" id="stepsBtn"/);
  assert.match(html, /quoteBtn:"🧮 Rental calculator", quoteTitle:"Rental calculator"/);
  assert.match(html, /byId\("quoteBtn"\)\.addEventListener\("click", \(\) => openQuotePopup\("step1"\)\);/);
});

test('the pop-up opens at once with the page inside, a language switch and a close button', () => {
  assert.match(html, /<div class="modal-overlay quote-modal" id="quoteModal">/);
  assert.match(html, /id="quoteLangBtn"/);
  assert.match(html, /<button class="xbtn" id="quoteClose"/);
  assert.match(html, /\/quote\/\?embed=1&src=web&lang=\$\{state\.lang === "en" \? "en" : "th"\}/);
  assert.match(html, /byId\("quoteModal"\)\.classList\.add\("open"\);/);
  assert.match(html, /byId\("quoteClose"\)\.addEventListener\("click", closeQuotePopup\);/);
  assert.match(html, /event\.key === "Escape" && byId\("quoteModal"\)\?\.classList\.contains\("open"\)\) closeQuotePopup\(\);/);
  assert.match(html, /if\(e\.target === byId\("quoteModal"\)\) closeQuotePopup\(\);/);
});

test('switching language keeps what was filled in: the frame is told, not reloaded', () => {
  const toggle = html.slice(html.indexOf('function toggleQuoteLang()'), html.indexOf('function openStepsPopup()'));
  assert.match(toggle, /postMessage\(\{type:"AJ_SET_LANG", lang:state\.lang\}, quoteFrameOrigin\(\)\)/);
  assert.doesNotMatch(toggle, /setAttribute\("src"/);
  assert.match(quote, /data\.type === 'AJ_SET_LANG'[^\n]*applyLanguage\(\);/);
  assert.match(quote, /body\.embed header \{ display:none; \}/);
});

test('its own address: ?quote=1 opens the booking page with the calculator up, and the pop-up copies it', () => {
  assert.match(html, /get\("quote"\) === "1" \|\| location\.hash === "#quote"\)\{\n\s+setTimeout\(\(\) => openQuotePopup\("link"\), 120\);/);
  assert.match(html, /<button class="copy-section-url" id="quoteCopyUrl" type="button"><\/button>/);
  assert.match(html, /byId\("quoteCopyUrl"\)\.addEventListener\("click", \(\) => copySectionUrl\("quote"\)\);/);
  assert.match(html, /copyQuoteUrl:"คัดลอก URL หน้าคำนวณค่าเช่า"/);
  assert.match(html, /copyQuoteUrl:"Copy rental-calculator URL"/);
});

test('"check the queue and book" never opens a new tab: in the pop-up it carries on in step 1', () => {
  assert.match(quote, /<a class="btn book" id="book" href="#" data-t="book"><\/a>/);
  assert.match(quote, /window\.parent\.postMessage\(\{ type: 'AJ_QUOTE_BOOK', consoleId: String\(c\.id\), bundleId: b \? b\.id : '' \}, '\*'\);/);
  const handler = html.slice(html.indexOf('event.data?.type === "AJ_QUOTE_BOOK"'), html.indexOf('trackAnalytics("quick_quote_popup_booked"'));
  assert.match(handler, /event\.source === byId\("quoteFrame"\)\?\.contentWindow/.source ? /closeQuotePopup\(\);/ : /x/);
  assert.match(handler, /selectCalcConsole\(pickedConsole\.id\);/);
  assert.match(handler, /state\.calc\.bundleId = bundle\.id;/);
  assert.match(html, /if\(event\.source === byId\("quoteFrame"\)\?\.contentWindow && event\.data\?\.type === "AJ_QUOTE_BOOK"\)/);
});

test('one name everywhere: menu, step 1, pop-up title and the page itself (TH/EN)', () => {
  assert.match(html, /quoteBtn:"🧮 คำนวณค่าเช่า", quoteTitle:"คำนวณค่าเช่า"/);
  assert.match(html, /<h3 id="quoteTitle">คำนวณค่าเช่า<\/h3>/);
  assert.match(quote, /title: 'คำนวณค่าเช่า'/);
  assert.match(quote, /title: 'Rental calculator'/);
  assert.doesNotMatch(html, /คำนวณค่าเช่าคร่าวๆ/);
});

test('book from the pop-up, even on the before-rent page: to the rental steps with that device\'s calendar open', () => {
  const handler = html.slice(html.indexOf('event.data?.type === "AJ_QUOTE_BOOK"'), html.indexOf('trackAnalytics("quick_quote_popup_booked"'));
  assert.match(handler, /setBeforeRent\(false, \{startGuide:true, scrollTo:false\}\);/);
  assert.match(handler, /state\.calc\.step = 1;/);
  assert.match(handler, /window\.setTimeout\(\(\) => openCalendar\("start"\), 120\);/);
});
