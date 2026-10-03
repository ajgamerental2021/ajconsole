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
  assert.match(widget, /if \(link\) return choose\(places\[0\], 'link'\);\n        if \(places\.length === 1\) return choose\(places\[0\], 'auto'\);\n        state\.choices = places;/);
  assert.match(widget, /<b>' \+ esc\(place\.name \|\| place\.address\) \+ '<\/b>' \+ address/);
  assert.match(widget, /function choose\(place, how\) \{\n      if \(!place\) return;\n      var box = input\(\);\n      close\(\);/, 'picking closes the list');
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
