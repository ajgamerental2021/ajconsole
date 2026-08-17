/**
 * Rental code allocator — hands out AJ-<yyyymmdd>-R<nnnn> codes that are unique.
 *
 * Why this exists
 * ---------------
 * The booking page used to build its own code in the browser: read the rental
 * sheet through gviz, take the highest R-number of the day, add one. Two
 * customers checking out within the same minute both read the same (cached)
 * sheet and both walked away with the same code — on 17/08/2026 three separate
 * rentals were all stamped AJ-20260817-R0009, which then merged into each
 * other in the shop's Booking app.
 *
 * Allocation therefore has to happen in one place, under a lock. This script is
 * that place: it serialises callers with LockService, looks at both the codes
 * already written to the rental log and the codes it has previously reserved,
 * and returns the first free number — reserving it before it answers, so a code
 * is never handed out twice even if the customer never finishes checkout.
 *
 * Deploy
 * ------
 * 1. Apps Script → new project (keep it separate from the rental-sheet web app
 *    so there is only ever one doGet per project).
 * 2. Paste this file, set SPREADSHEET_ID below if it ever changes.
 * 3. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Copy the /exec URL into CONFIG.rentalCodeWebApp in index.html.
 *
 * Endpoints (GET, JSON):
 *   ?action=allocateRentalCode[&ymd=20260817]   → { ok, code, reserved }
 *   ?action=peekRentalCodes[&ymd=20260817]      → { ok, ymd, used: [...] }
 */

var SPREADSHEET_ID = '13QZWpd_E-L_0G_Xd0zSL5_OcgV4sdwk9febXZSkZepc';
var LOG_SHEET_GID = 1105203002;           // "Line / WhatsApp LOGs"
var LOG_CODE_HEADER = 'รหัสการเช่า';
var CONTRACT_SHEET_NAME = 'AJ Contract';  // contracts carry the same codes
var CONTRACT_CODE_HEADER = 'Rental Code';
var RESERVATION_SHEET_NAME = 'Rental Code Reservations';
var LOCK_TIMEOUT_MS = 20000;
var MAX_NUMBER = 9999;

function doGet(e) {
  var action = String((e && e.parameter && e.parameter.action) || '').trim();
  var ymd = normaliseYmd((e && e.parameter && e.parameter.ymd) || '');

  try {
    if (action === 'allocateRentalCode') return json(allocateRentalCode(ymd));
    if (action === 'peekRentalCodes') return json({ ok: true, ymd: ymd, used: usedCodesForDay(ymd) });
    return json({ ok: false, error: 'unknown action' });
  } catch (error) {
    return json({ ok: false, error: String((error && error.message) || error) });
  }
}

/** Same contract as doGet, so a POST from a browser works too. */
function doPost(e) {
  return doGet(e);
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Bangkok date as yyyymmdd — the booking page names codes after that day. */
function normaliseYmd(value) {
  var raw = String(value || '').replace(/\D/g, '');
  if (raw.length === 8) return raw;
  return Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd');
}

function formatRentalCode(ymd, n) {
  return 'AJ-' + ymd + '-R' + ('0000' + String(n)).slice(-4);
}

/**
 * Number inside a code for this day, or 0. Tolerates the "-XYZ" suffix the
 * booking page adds when it has to fall back to allocating offline, so those
 * codes still raise the counter instead of being handed out again.
 */
function rentalCodeNumber(code, ymd) {
  var m = String(code || '')
    .trim()
    .match(new RegExp('^AJ-' + ymd + '-R(\\d+)(?:-[A-Z0-9]+)?$', 'i'));
  return m ? Number(m[1]) || 0 : 0;
}

function sheetByGid(spreadsheet, gid) {
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i += 1) {
    if (sheets[i].getSheetId() === gid) return sheets[i];
  }
  return null;
}

/** Every value in one header's column, as trimmed strings. */
function columnValues(sheet, headerName) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var index = -1;
  for (var i = 0; i < headers.length; i += 1) {
    if (String(headers[i] || '').trim() === headerName) {
      index = i + 1;
      break;
    }
  }
  if (index < 1) return [];
  var values = sheet.getRange(2, index, lastRow - 1, 1).getValues();
  var out = [];
  for (var r = 0; r < values.length; r += 1) {
    var v = String(values[r][0] || '').trim();
    if (v) out.push(v);
  }
  return out;
}

function reservationSheet(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(RESERVATION_SHEET_NAME);
  if (sheet) return sheet;
  sheet = spreadsheet.insertSheet(RESERVATION_SHEET_NAME);
  sheet.getRange(1, 1, 1, 3).setValues([['code', 'reservedAt', 'source']]);
  return sheet;
}

/**
 * Codes that are taken for a day: written to the rental log, written onto a
 * contract, or reserved here and not yet used. A reservation is never expired —
 * skipping a number costs nothing, reusing one costs a mixed-up rental.
 */
function usedCodesForDay(ymd) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var codes = []
    .concat(columnValues(sheetByGid(spreadsheet, LOG_SHEET_GID), LOG_CODE_HEADER))
    .concat(columnValues(spreadsheet.getSheetByName(CONTRACT_SHEET_NAME), CONTRACT_CODE_HEADER))
    .concat(columnValues(reservationSheet(spreadsheet), 'code'));

  var seen = {};
  var out = [];
  for (var i = 0; i < codes.length; i += 1) {
    if (rentalCodeNumber(codes[i], ymd) > 0 && !seen[codes[i]]) {
      seen[codes[i]] = true;
      out.push(codes[i]);
    }
  }
  return out;
}

/**
 * Reserve and return the next free code for the day.
 *
 * The lock covers read → decide → reserve, so concurrent callers queue up and
 * each gets its own number. If the lock cannot be taken we return an error
 * rather than a guess; the caller then falls back to a suffixed code that
 * cannot collide with a sequential one.
 */
function allocateRentalCode(ymd) {
  var day = normaliseYmd(ymd);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
    return { ok: false, error: 'busy' };
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var taken = {};
    var highest = 0;
    var codes = []
      .concat(columnValues(sheetByGid(spreadsheet, LOG_SHEET_GID), LOG_CODE_HEADER))
      .concat(columnValues(spreadsheet.getSheetByName(CONTRACT_SHEET_NAME), CONTRACT_CODE_HEADER))
      .concat(columnValues(reservationSheet(spreadsheet), 'code'));

    for (var i = 0; i < codes.length; i += 1) {
      var n = rentalCodeNumber(codes[i], day);
      if (n > 0) {
        taken[n] = true;
        if (n > highest) highest = n;
      }
    }

    var next = highest + 1;
    while (taken[next] && next <= MAX_NUMBER) next += 1;
    if (next > MAX_NUMBER) return { ok: false, error: 'day exhausted' };

    var code = formatRentalCode(day, next);
    reservationSheet(spreadsheet)
      .appendRow([code, new Date().toISOString(), 'allocator']);
    SpreadsheetApp.flush();
    return { ok: true, code: code, reserved: true };
  } finally {
    lock.releaseLock();
  }
}
