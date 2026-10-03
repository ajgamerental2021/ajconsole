import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const quote = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');
const widget = readFileSync(new URL('../assets/place-search.js', import.meta.url), 'utf8');

function loadWidget() {
  const window = {};
  vm.runInNewContext(widget, { window, document: {}, setTimeout, clearTimeout });
  return window.AJPlaceSearch;
}

test('one place box for the calculator and booking step 2', () => {
  assert.match(quote, /<script src="\.\.\/assets\/place-search\.js\?v=([\w-]+)"><\/script>/);
  assert.match(html, /<script src="assets\/place-search\.js\?v=([\w-]+)"><\/script>/);
  assert.equal(quote.match(/place-search\.js\?v=([\w-]+)/)[1], html.match(/place-search\.js\?v=([\w-]+)/)[1], 'both pages load the same version');
  assert.match(quote, /AJPlaceSearch\.create\(\{\n    input: '#maps',/);
  assert.match(html, /window\.AJPlaceSearch\.create\(\{\n        input:"#demoMaps",/);
});

test('the box waits for the customer to finish typing, and never asks per keystroke', () => {
  assert.match(widget, /var TYPING_PAUSE_MS = 1500;/);
  assert.match(widget, /var MIN_CHARS = 4;/);
  assert.match(widget, /if \(!link && text\.length < \(opts\.auto \? MIN_CHARS : 3\)\) return;/);
  assert.match(widget, /compositionstart[\s\S]*state\.composing = true/);
  assert.match(widget, /document\.addEventListener\('paste', function \(event\) \{ if \(mine\(event\)\) setTimeout\(function \(\) \{ schedule\(0\); \}, 0\); \}\);/);
  assert.match(widget, /if \(text === state\.lastText && !opts\.force\) return;/, 'the same text is not looked up twice');
  assert.match(widget, /if \(seq !== state\.seq\) return;/, 'an answer overtaken by more typing is dropped');
});

test('one match is taken; several open a list of name + full address; a link stands as is', () => {
  assert.match(widget, /if \(link\) return choose\(places\[0\], opts\.pin \? 'pin' : 'link'\);\n        if \(places\.length === 1\) return choose\(places\[0\], 'auto'\);\n        state\.choices = places;/);
  assert.match(widget, /<b>' \+ esc\(place\.name \|\| place\.address\) \+ '<\/b>' \+ address/);
  assert.match(widget, /function choose\(place, how\) \{\n      if \(!place\) return;[\s\S]{0,300}?var box = input\(\);\n      close\(\);/, 'picking closes the list');
  assert.match(widget, /el\.addEventListener\('mousedown', function \(event\) \{ event\.preventDefault\(\); \}\);/);
  assert.match(widget, /event\.key === 'ArrowDown' \|\| event\.key === 'ArrowUp'/);
  assert.match(widget, /box\.setAttribute\('role', 'combobox'\);/);
  assert.match(widget, /apiBase\(\) \+ '\/api\/places\/search'/);
});

test('the box speaks Thai and English', () => {
  const th = widget.slice(widget.indexOf('th: {'), widget.indexOf('en: {'));
  const en = widget.slice(widget.indexOf('en: {'), widget.indexOf('var TYPING_PAUSE_MS'));
  for (const key of ['searching', 'choose', 'none', 'linkNone', 'failed', 'tooMany']) {
    assert.match(th, new RegExp(`${key}: '[^']*[\\u0E00-\\u0E7F]`), `Thai ${key}`);
    assert.match(en, new RegExp(`${key}: '[A-Z]`), `English ${key}`);
  }
});

test('a place reads as its name and address, without saying the name twice', () => {
  const { label, isLink } = loadWidget();
  assert.equal(label({ name: 'เซ็นทรัลเวิลด์', address: 'ปทุมวัน กรุงเทพมหานคร' }), 'เซ็นทรัลเวิลด์ · ปทุมวัน กรุงเทพมหานคร');
  assert.equal(label({ name: 'Siam Paragon', address: 'Siam Paragon, Rama I Road' }), 'Siam Paragon, Rama I Road');
  assert.equal(label({ name: '', address: 'Bangkok' }), 'Bangkok');
  assert.equal(isLink('https://maps.app.goo.gl/abc'), true);
  assert.equal(isLink('คอนโด https://x'), false);
});

test('step 2: typed text counts once a place is chosen; a link counts at once; the place shows in green', () => {
  assert.match(html, /mapsText:"", mapsPlace:null,/);
  assert.match(html, /"maps","mapsText","mapsPlace","termsAccepted"/);
  assert.match(html, /demoProfile\.maps = window\.AJPlaceSearch\?\.isLink\(value\) \? value\.trim\(\) : "";/);
  assert.match(html, /function onDemoPlaceChosen\(place\)\{\n    const link = String\(place\?\.link \|\| place\?\.pin \|\| ""\)\.trim\(\);/);
  assert.match(html, /if\(state\.calc\.demoOrderOpen\) renderDemoOrderPage\(\);\n  \}\n  \/\/ After step 2 is drawn/);
  assert.match(html, /value="\$\{esc\(demoMapsBoxText\(\)\)\}" placeholder="\$\{en \? "Type a place or address, or paste a Google Maps link" : "พิมพ์ชื่อสถานที่ \/ ที่อยู่ หรือวางลิงก์ Google Maps"\}">\$\{demoMapsFoundHtml\(\)\}/);
  assert.match(html, /<p class="hint demo-maps-found" id="demoMapsFound"\$\{text \? "" : " hidden"\}><a id="demoMapsFoundLink" href="\$\{esc\(text \? safeHref\(demoProfile\.maps\) : "#"\)\}" target="_blank" rel="noopener">/);
  assert.match(html, /📍 ส่งไปที่: \$\{label\} \(กดเพื่อเปิดดูใน Google Maps\)/);
  assert.match(html, /📍 Delivering to: \$\{label\} \(tap to open in Google Maps\)/);
  assert.match(html, /"เลือกสถานที่ส่งจากรายการใต้ช่อง หรือวางลิงก์ Google Maps"/);
  assert.doesNotMatch(html, /demoMaps:"maps"/, 'the box is the place search\'s, not a plain text field');
  // A saved link, the calculator's link or "my location" is looked up once, quietly.
  assert.match(html, /demoMapsLookedUp !== demoProfile\.maps\)\{\n      demoMapsLookedUp = demoProfile\.maps;\n      search\.lookup\(\{force:true, quiet:true\}\);/);
  assert.match(html, /demoProfile\.mapsPlace = demoMapsPlace\(demoProfile\.mapsPlace\);/);
});

test('calculator: a PS5 or PS5 Pro takes one accessory, "no accessory" chosen to begin with', () => {
  assert.match(quote, /var PS5_ID = '11', PS5P_ID = '18'/);
  assert.match(quote, /function singleAccessory\(c\) \{ return !!c && \(String\(c\.id\) === PS5_ID \|\| String\(c\.id\) === PS5P_ID\); \}/);
  assert.match(quote, /var kind = single \? 'type="radio" name="singleExtra"' : 'type="checkbox"';/);
  assert.match(quote, /data-extra=""' \+ \(picked\.length \? '' : ' checked'\) \+ '><span><b>' \+ t\('noAccessory'\) \+ '<\/b><span class="included">' \+ t\('included'\) \+ '<\/span>/);
  assert.match(quote, /noAccessory: 'ไม่เพิ่มอุปกรณ์เสริม', included: 'รวม 2 จอยในราคาเช่าปกติแล้ว'/);
  assert.match(quote, /noAccessory: 'No accessory', included: '2 controllers included'/);
  assert.match(quote, /if \(e\.target\.type === 'radio'\) picked = id \? \[id\] : \[\];/);
  assert.match(quote, /if \(single\) picked = picked\.slice\(0, 1\);/);
  // The booking page does the same.
  assert.match(html, /const single = \[SPEC\.PS5, SPEC\.PS5P\]\.includes\(Number\(c\.id\)\);/);
});

const pinMap = readFileSync(new URL('../assets/pin-map.html', import.meta.url), 'utf8');

test('a pin from the map or the phone: the map needs no permission and opens where location is refused', () => {
  // The map is its own page next to the widget, found from any page.
  assert.match(widget, /var SELF = \(document\.currentScript && document\.currentScript\.src\) \|\| '';/);
  assert.match(widget, /new URL\('pin-map\.html', SELF \|\| location\.href\)\.href \+ '\?v=[\w-]+&lang=' \+ lang/);
  assert.match(widget, /<iframe class="ajps-map" title=""><\/iframe>' \+ PIN_SVG/);
  assert.match(pinMap, /css\.href = 'vendor\/leaflet-1\.9\.4\/leaflet\.css';/);
  assert.ok(readFileSync(new URL('../assets/vendor/leaflet-1.9.4/leaflet.js', import.meta.url), 'utf8').includes('t.version="1.9.4"'));
  assert.ok(readFileSync(new URL('../assets/vendor/leaflet-1.9.4/LICENSE', import.meta.url), 'utf8').length > 100);
  assert.match(pinMap, /L\.tileLayer\('https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png'/);
  assert.match(pinMap, /OpenStreetMap<\/a>/, 'tiles are credited');
  // A refused location opens the map, saying why; Facebook and Instagram by name.
  assert.match(widget, /function blockingApp\(\) \{ return \/FBAN\|FBAV\|FB_IAB\|FBIOS\|Instagram\/i\.test/);
  assert.match(widget, /\.then\(function \(at\) \{ return at \|\| fallback\(\); \}\);/);
  assert.match(widget, /noteKey: blockingApp\(\) \? 'blockedApp' : 'blocked'/);
  assert.match(widget, /blockedApp: 'แอป Facebook \/ Instagram ไม่ให้เว็บใช้ตำแหน่งปัจจุบัน ปักหมุดบนแผนที่นี้แทนได้เลย'/);
  assert.match(widget, /blockedApp: 'The Facebook \/ Instagram app does not let web pages use your location\. Pin it on this map instead\.'/);
  // The pin is a place even when no address is found for it.
  assert.match(widget, /if \(!places\.length && opts\.pinAt\) return choose\(pinPlace\(opts\.pinAt\), 'pin'\);/);
  assert.match(widget, /if \(!inThailand\(at\.lat, at\.lng\)\) return say\(t\('mapOutside'\)\);/);
  // Both pages offer it.
  assert.match(quote, /<button class="chip locate" id="pinMap" type="button" data-t="pinMap"><\/button>/);
  assert.match(quote, /placeSearch\.pickOnMap\(\)\.then\(function \(at\) \{ if \(at\) placeSearch\.usePin\(at\); \}\);/);
  assert.match(html, /data-demo-pin-map>\$\{en \? "🗺️ Pin it on a map" : "🗺️ ปักหมุดบนแผนที่"\}<\/button><\/div><p class="hint">/);
  assert.match(html, /if\(event\.target\.closest\("\[data-demo-pin-map\]"\)\)\{ pinDemoOnMap\(\); return; \}/);
  assert.match(html, /search\.locate\(\)\.then\(useDemoPin\);/);
});

test('the map is Google Maps with the Bot\'s browser key, OpenStreetMap without it or when Google refuses', () => {
  assert.match(pinMap, /fetch\(api \+ '\/api\/config', \{ cache: 'no-store' \}\)/);
  assert.match(pinMap, /config\.googleMapsBrowserKey/);
  assert.doesNotMatch(widget + pinMap + html + quote, /AIza[0-9A-Za-z_-]{20,}/, 'no Google key in the site\'s files');
  assert.match(pinMap, /'https:\/\/maps\.googleapis\.com\/maps\/api\/js\?key=' \+ encodeURIComponent\(key\)\n        \+ '&v=weekly&loading=async&region=TH&language=' \+ lang/);
  assert.match(pinMap, /window\.gm_authFailure = function \(\) \{ drawLeaflet\(\); \};/);
  assert.match(pinMap, /\? drawGoogle\(key\)\.catch\(drawLeaflet\) : drawLeaflet\(\)/);
  assert.match(pinMap, /mapTypeIds: \['roadmap', 'hybrid'\]/);
  assert.match(pinMap, /gestureHandling: 'greedy'/);
});

test('the map sheet has its own TH / EN button: its words and the map\'s labels switch, the map stays put', () => {
  assert.match(widget, /mapLang: '🇬🇧 EN',/);
  assert.match(widget, /mapLang: '🇹🇭 TH',/);
  assert.match(widget, /\$\('\.ajps-map-lang'\)\.addEventListener\('click', function \(\) \{\n        var at = spot\(\);\n        if \(at\) view = \{ lat: at\.lat, lng: at\.lng, zoom: at\.zoom \|\| view\.zoom \};\n        lang = lang === 'en' \? 'th' : 'en';\n        words\(\);\n        load\(\);/);
  assert.match(widget, /onLang: function \(lang\) \{ state\.mapLang = lang; \}/, 'the choice holds for the next map on the page');
  for (const key of ['mapTitle', 'mapHelp', 'mapUse', 'mapCancel', 'mapLoading', 'mapLangLabel']) {
    assert.equal((widget.match(new RegExp(`\\b${key}: '`, 'g')) || []).length, 2, `${key} in Thai and English`);
  }
});

test('games cannot change during the rental: picker header, rental item card, both languages', () => {
  const picker = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');
  assert.match(html, /<span class="attention-msg" data-i18n="gameChangeWarning">⚠️ ไม่สามารถเพิ่มหรือเปลี่ยนเกมได้ระหว่างระยะเวลาเช่า<\/span>/);
  assert.match(html, /gameChangeWarning:"⚠️ Games cannot be added or changed during the rental period\."/);
  assert.match(picker, /<span class="attention-msg" data-i18n="pick_game_change">⚠️ ไม่สามารถเพิ่มหรือเปลี่ยนเกมได้ระหว่างระยะเวลาเช่า<\/span>/);
  assert.match(picker, /pick_game_change: '⚠️ Games cannot be added or changed during the rental period\.'/);
  // One badge, the notices taking turns; the later ones lie over the first and
  // shrink to fit, so the header (and the game grid under it) keeps its size.
  for (const page of [html, picker]) {
    assert.match(page, /data-attention-rotate/);
    assert.match(page, /\.attention-msg ?\+ ?\.attention-msg ?\{ ?position: ?absolute; ?inset: ?0;/);
    assert.match(page, /if ?\(next !== notices\[0\]\) fitAttentionNotice\(next\);/);
  }
  assert.match(html, /\$\{state\.calc\.games\?\.length \|\| state\.calc\.later \? gameChangeNoticeHtml\(\) : ""\}/);
  assert.match(html, /\$\{r\.games\.length \|\| r\.later \? gameChangeNoticeHtml\(\) : ""\}/);
});
