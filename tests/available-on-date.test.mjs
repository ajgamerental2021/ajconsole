import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('"เช็คคิวว่างวันที่": a picked start date shows only consoles free for the minimum rental', () => {
  // The same start-day rules as the booking calendar, shared with "available today".
  assert.match(html, /function consoleBookableFrom\(c, matches, day, isToday, earliestStart, catalogReady\)\{\n    const end = addDays\(day, MIN_RENTAL_DAYS\);/);
  assert.match(html, /if\(!consoleBookableFrom\(c, matches, day, offset === 0, earliestStart, catalogReady\)\) continue;/);
  assert.match(html, /function consoleAvailabilityOn\(c, iso\)/);
  assert.match(html, /if\(dateIso\) return consoleAvailabilityOn\(c, dateIso\)\.kind === "on";/);
  // Both lists filter and badge by the picked date.
  assert.match(html, /\.filter\(item => passesAvailabilityFilter\(item, state\.beforeRentTodayOnly, state\.beforeRentDate\)\)/);
  assert.match(html, /&& passesAvailabilityFilter\(item, state\.allConsolesTodayOnly, state\.allConsolesDate\)\);/);
  assert.match(html, /const availability = availabilityFor\(item, state\.beforeRentDate\);/);
  assert.match(html, /availabilityBadge\(availabilityFor\(c, state\.allConsolesDate\)\)/);
  // Today picked = the "available today" filter.
  assert.match(html, /const isToday = picked && picked === todayIso\(\);/);
});

test('the home row keeps two lines: "ว่างวันนี้" and a calendar as one chip; the full list has a labelled chip (TH/EN)', () => {
  assert.match(html, /<span class="before-rent-avail-group">/);
  assert.match(html, /<input type="date" data-before-date min="\$\{bounds\.min\}" max="\$\{bounds\.max\}"/);
  assert.match(html, /availableDateChip:"ว่าง \{date\}"/);
  assert.match(html, /availableDateChip:"Free \{date\}"/);
  assert.match(html, /availableDateFilter:"เช็คคิวว่างวันที่"/);
  assert.match(html, /availableDateFilter:"Check a date"/);
  assert.match(html, /availableTodayFilter:"Free today"/);
  assert.match(html, /id="allConsolesDateFilter"[\s\S]*?<input type="date" id="allConsolesDateInput">/);
  assert.match(html, /availableDateEmpty:"ไม่พบเครื่องที่ว่างให้เช่าได้ตั้งแต่ \{date\} \(เช่าได้ 3 วันขึ้นไป\)"/);
});

test('the device cards no longer say "คืนเต็ม*" / "refundable*"', () => {
  assert.doesNotMatch(html, /tr\("beforeRentDepositBack"\)\)\}\*<\/em>/);
  assert.match(html, /<span class="before-rent-device-dep">\$\{icon\("lock"\)\}<span>\$\{esc\(tr\("deposit"\)\)\} \$\{esc\(money\(item\.deposit\)\)\}<\/span><\/span>/);
});

test('the phone calendar stays open: no second open call on touch, and no redraw while it is open', () => {
  // A tap opens the native picker on iPhone and Android; showPicker only with a mouse.
  assert.match(html, /if\(!window\.matchMedia\?\.\("\(hover: hover\) and \(pointer: fine\)"\)\.matches\) return;/);
  // Open from the first touch until a date is chosen or it closes; redraws wait for that.
  assert.match(html, /function datePickerOpen\(input\)\{ return Boolean\(input && input\.dataset\.pickerOpen === "1"\); \}/);
  assert.match(html, /input\.addEventListener\("pointerdown", open\);/);
  assert.match(html, /if\(datePickerOpen\(openPicker\)\)\{[\s\S]*?openPicker\.addEventListener\("aj-picker-closed", renderBeforeRentTypeFilter, \{once:true\}\);/);
  assert.match(html, /trackDatePicker\(dateInput, value => applyAvailabilityDate\("before", value\)\);/);
  assert.match(html, /trackDatePicker\(byId\("allConsolesDateInput"\), value => applyAvailabilityDate\("all", value\)\);/);
  assert.match(html, /if\(!datePickerOpen\(byId\("allConsolesDateInput"\)\)\)\{/);
});
