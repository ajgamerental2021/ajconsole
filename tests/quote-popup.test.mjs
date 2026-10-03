import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const quote = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');

test('two ways in: the menu, and step 1 beside the rental steps (TH/EN)', () => {
  assert.match(html, /\["quote", "calculator", en \? "Rental calculator" : "คำนวณค่าเช่า"\], \["prices"/);
  assert.match(html, /if\(action === "quote"\) openQuotePopup\("menu"\);/);
  // Not in step 1: there it competed with the booking itself.
  assert.doesNotMatch(html, /id="quoteBtn"/);
  assert.match(html, /quoteBtn:"🧮 Rental calculator", quoteBtnHint:"See the total before booking", quoteTitle:"Rental calculator"/);
});

test('the pop-up opens at once with the page inside, a language switch and a close button', () => {
  assert.match(html, /<div class="modal-overlay quote-modal" id="quoteModal">/);
  assert.match(html, /id="quoteLangBtn"/);
  assert.match(html, /<button class="xbtn" id="quoteClose"/);
  assert.match(html, /\/quote\/\?embed=1&src=web&v=\$\{QUOTE_PAGE_VERSION\}&lang=\$\{state\.lang === "en" \? "en" : "th"\}/);
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
  assert.match(quote, /window\.parent\.postMessage\(\{\n      type: 'AJ_QUOTE_BOOK', consoleId: String\(c\.id\), bundleId: b \? b\.id : '', mapsUrl: quote \? quotedMapsLink : '',/);
  const handler = html.slice(html.indexOf('event.data?.type === "AJ_QUOTE_BOOK"'), html.indexOf('trackAnalytics("quick_quote_popup_booked"'));
  assert.match(handler, /closeQuotePopup\(\);/);
  assert.match(handler, /startBookingWithCalendar\(pickedConsole/);
  assert.match(html, /state\.calc\.bundleId = bundle\.id;/);
  assert.match(html, /if\(event\.source === byId\("quoteFrame"\)\?\.contentWindow && event\.data\?\.type === "AJ_QUOTE_BOOK"\)/);
});

test('one name everywhere: menu, step 1, pop-up title and the page itself (TH/EN)', () => {
  assert.match(html, /quoteBtn:"🧮 คำนวณค่าเช่า", quoteBtnHint:"รู้ยอดรวมก่อนจอง", quoteTitle:"คำนวณค่าเช่า"/);
  assert.match(html, /<h3 id="quoteTitle">คำนวณค่าเช่า<\/h3>/);
  assert.match(quote, /title: 'คำนวณค่าเช่า'/);
  assert.match(quote, /title: 'Rental calculator'/);
  assert.doesNotMatch(html, /คำนวณค่าเช่าคร่าวๆ/);
});

test('book from the pop-up, even on the before-rent page: to the rental steps with that device\'s calendar open', () => {
  const handler = html.slice(html.indexOf('event.data?.type === "AJ_QUOTE_BOOK"'), html.indexOf('trackAnalytics("quick_quote_popup_booked"'));
  assert.match(handler, /startBookingWithCalendar\(pickedConsole, String\(event\.data\.bundleId \|\| ""\)\);/);
  const start = html.slice(html.indexOf('function startBookingWithCalendar('), html.indexOf('function openStepsPopup()'));
  assert.match(start, /setBeforeRent\(false, \{startGuide:true, scrollTo:false\}\);/);
  assert.match(start, /state\.calc\.step = 1;/);
  assert.match(start, /window\.setTimeout\(\(\) => openCalendar\("start"\), 120\);/);
});

test('the all-devices pop-up has the calculator button too; booking from it closes both', () => {
  assert.match(html, /<button class="copy-section-url all-consoles-quote" id="allConsolesQuote" type="button"><\/button><button class="copy-section-url all-consoles-copy-url" id="allConsolesCopyUrl"/);
  assert.match(html, /byId\("allConsolesQuote"\)\.textContent = tr\("quoteBtn"\);/);
  assert.match(html, /byId\("allConsolesQuote"\)\.addEventListener\("click", \(\) => openQuotePopup\("all_consoles"\)\);/);
  assert.match(html, /if\(byId\("allConsolesModal"\)\?\.classList\.contains\("open"\)\) closeAllConsoles\(\);/);
  assert.ok(html.indexOf('id="quoteModal"') > html.indexOf('id="allConsolesModal"'), 'the calculator sits above the list');
});

test('every bookable device card has its own calculator button, opening with that device', () => {
  assert.match(html, /\$\{ready \? `<button class="btn card-quote-btn" data-card-quote="\$\{esc\(String\(c\.id\)\)\}" type="button"><span>\$\{esc\(tr\("quoteBtn"\)\)\}<\/span><small>\$\{esc\(tr\("quoteBtnHint"\)\)\}<\/small><\/button>` : ""\}/);
  assert.match(html, /if\(cardQuote\)\{ openQuotePopup\("card", cardQuote\.dataset\.cardQuote\); return; \}/);
  assert.match(html, /&device=\$\{encodeURIComponent\(device\)\}/);
  assert.match(html, /postMessage\(\{type:"AJ_SET_DEVICE", consoleId:device\}, quoteFrameOrigin\(\)\)/);
});

test('device cards: every button sits together at the bottom; "check the queue and book" opens that device\'s calendar', () => {
  assert.match(html, /\.con-actions\{margin-top:auto;display:flex;flex-direction:column;gap:inherit\}/);
  assert.match(html, /\.all-consoles-book\{width:100%;min-height:38px/);
  assert.match(html, /<div class="con-actions">\n\s+\$\{gameButtonVisible/);
  const handler = html.slice(html.indexOf('const allConsoleBook = event.target.closest'), html.indexOf('const typeBtn = event.target.closest'));
  assert.match(handler, /closeAllConsoles\(\);/);
  assert.match(handler, /startBookingWithCalendar\(selectedConsole\);/);
});

test('the calculator button stands out: gold, a hint under the label, a shine that respects reduced motion', () => {
  assert.match(html, /\.card-quote-btn,\.copy-section-url\.all-consoles-quote\{[^}]*background:linear-gradient\(180deg,#ffd84d,#ffbf1f\)/);
  assert.match(html, /animation:quote-shine 2\.8s ease-in-out \.6s 3/);
  assert.match(html, /@media \(prefers-reduced-motion:reduce\)\{\.card-quote-btn::after/);
});

test('delivery is priced by itself once a place is chosen in the shared place box', () => {
  assert.match(quote, /<script src="\.\.\/assets\/place-search\.js\?v=[\w-]+"><\/script>/);
  assert.match(quote, /var placeSearch = AJPlaceSearch\.create\(\{\n    input: '#maps',/);
  assert.match(quote, /onPlace: function \(place\) \{\n      chosenPlace = place;[\s\S]*?getQuote\(\{ auto: true \}\);/);
  // Typing makes the earlier place and price void; the price waits for a place.
  assert.match(quote, /onInput: function \(\) \{\n      chosenPlace = null; quote = null; lastQuoteKey = '';/);
  assert.match(quote, /if \(!chosenPlace\) \{\n      if \(options\.auto\) return null;/);
  assert.match(quote, /if \(!placeSearch\.pickActive\(\)\) placeSearch\.lookup\(\{ force: true \}\);/);
  assert.match(quote, /mapsUrl: chosenPlace\.pin \|\| chosenPlace\.link/);
  assert.match(quote, /if \(seq !== quoteSeq\) return null;/);
  assert.match(quote, /if \(options\.auto && key === lastQuoteKey && quote\) return null;/);
});

test('the chosen place opens in Google Maps and goes into step 2 with its name', () => {
  assert.match(quote, /<a id="foundPlaceLink" target="_blank" rel="noopener"><\/a>/);
  assert.match(quote, /quotedMapsLink = place \? String\(place\.link \|\| place\.pin \|\| ''\) : '';/);
  assert.match(quote, /'&maps=' \+ encodeURIComponent\(quotedMapsLink\)/);
  assert.match(quote, /place: quote && chosenPlace \? \{ name: chosenPlace\.name \|\| '', address: chosenPlace\.address \|\| '', lat: chosenPlace\.lat, lng: chosenPlace\.lng, lang: chosenPlace\.lang \|\| lang, link: quotedMapsLink \} : null/);
  assert.match(html, /adoptQuoteMapsLink\(event\.data\.mapsUrl, event\.data\.place\);/);
  assert.match(html, /if\(String\(demoProfile\.maps \|\| ""\)\.trim\(\)\) return false;/);
});
