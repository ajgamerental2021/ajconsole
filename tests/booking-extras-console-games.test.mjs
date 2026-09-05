import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('booking mode keeps promotions and the full console grid behind one bilingual toggle', () => {
  assert.match(source, /id="bookingExtrasBtn"[^>]+aria-expanded="false"/);
  assert.match(source, /bookingExtrasShow:"ดูโปรโมชั่นและเครื่องอื่น ๆ"/);
  assert.match(source, /bookingExtrasShow:"View promotions & other consoles"/);
  assert.match(source, /body:not\(\.booking-extras-open\) #homeSections,body:not\(\.booking-extras-open\) #consoles\{display:none\}/);
  assert.match(source, /state\.bookingExtrasOpen = !state\.bookingExtrasOpen/);
});

test('compact console cards expose a contextual browse-only game list without changing the booking console', () => {
  assert.match(source, /beforeRentDeviceGames:"ดูเกมของเครื่องนี้"/);
  assert.match(source, /beforeRentDeviceGames:"View games for this console"/);
  assert.match(source, /gameUrl\(item\) \? `<button class="before-rent-device-games"/);
  assert.match(source, /openGamePicker\(\{browseOnly:true, consoleId:button\.dataset\.beforeDeviceGames\}\)/);
  const handlerStart = source.indexOf('deviceHost.querySelectorAll("[data-before-device-games]")');
  const handler = source.slice(handlerStart, source.indexOf('deviceHost.querySelector("[data-before-seeall]")', handlerStart));
  assert.doesNotMatch(handler, /state\.calc\.consoleId\s*=/);
  assert.match(source, /const requested = options\.consoleId \? consoleById\(options\.consoleId\) : null/);
});
