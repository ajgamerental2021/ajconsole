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
  assert.match(html, /<button class="before-rent-typechip before-rent-date-pick" type="button" data-before-date aria-haspopup="dialog"/);
  assert.match(html, /availableDateChip:"ว่าง \{date\}"/);
  assert.match(html, /availableDateChip:"Free \{date\}"/);
  assert.match(html, /availableDateFilter:"เช็คคิวว่างวันที่"/);
  assert.match(html, /availableDateFilter:"Check a date"/);
  assert.match(html, /availableTodayFilter:"Free today"/);
  assert.match(html, /<button class="all-consoles-today-filter all-consoles-date-filter" id="allConsolesDateFilter" type="button"/);
  assert.match(html, /availableDateEmpty:"ไม่พบเครื่องที่ว่างให้เช่าได้ตั้งแต่ \{date\} \(เช่าได้ 3 วันขึ้นไป\)"/);
});

test('the device cards no longer say "คืนเต็ม*" / "refundable*"', () => {
  assert.doesNotMatch(html, /tr\("beforeRentDepositBack"\)\)\}\*<\/em>/);
  assert.match(html, /<span class="before-rent-device-dep">\$\{icon\("lock"\)\}<span>\$\{esc\(tr\("deposit"\)\)\} \$\{esc\(money\(item\.deposit\)\)\}<\/span><\/span>/);
});

test('the date is picked on the site\'s own calendar, not the phone\'s (TH/EN)', () => {
  // iPhone put today into an empty date input as the picker opened and the
  // redraw closed it: no native date input is left on these chips.
  assert.doesNotMatch(html, /type="date" data-before-date|id="allConsolesDateInput"|function trackDatePicker|showPicker\?\.\(\)/);
  assert.match(html, /host\.querySelector\("\[data-before-date\]"\)\?\.addEventListener\("click", \(\) => openAvailabilityCalendar\("before"\)\);/);
  assert.match(html, /byId\("allConsolesDateFilter"\)\.addEventListener\("click", \(\) => openAvailabilityCalendar\("all"\)\);/);
  // It lives in its own layer on the page, outside the lists that redraw.
  assert.match(html, /document\.body\.insertAdjacentHTML\("beforeend", `<div class="avail-cal-layer" id="availCalLayer" hidden>/);
  // Days outside the bookable range cannot be picked; a pick goes through the same filter.
  assert.match(html, /const off = \(min && date < min\) \|\| \(max && date > max\);/);
  assert.match(html, /applyAvailabilityDate\(scope, button\.dataset\.availDay \|\| ""\);/);
  // Its own attribute names: the booking calendar's document click handler owns data-cal-day.
  assert.doesNotMatch(html.slice(html.indexOf('const availCal = '), html.indexOf('function availabilityBadge(status)')), /data-cal-/);
  for (const key of ['availableDateCalHint', 'availableDateCalClose', 'availableDatePrevMonth', 'availableDateNextMonth']) {
    assert.equal(html.match(new RegExp(`${key}:"`, 'g'))?.length, 2, `${key} in TH and EN`);
  }
});
