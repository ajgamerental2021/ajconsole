// On-device document reading. The image stays in the browser; the OCR worker and
// language models are served by AJ. Results are suggestions and are validated
// again before a rental can continue.
(function (global) {
  'use strict';
  const base = new URL('vendor/ocr/', (typeof document !== 'undefined' && document.currentScript?.src) || global.location?.href || 'https://ajgamerental.com/assets/identity-ocr.js');
  let library;
  let worker;
  const thaiIdValid = (digits) => {
    if (!/^\d{13}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (13 - i);
    return (11 - sum % 11) % 10 === Number(digits[12]);
  };
  function isoDate(day, month, year) {
    let y = Number(year);
    if (y > 2400) y -= 543;
    if (y < 100) y += y < 50 ? 2000 : 1900;
    const d = new Date(Date.UTC(y, Number(month) - 1, Number(day)));
    if (d.getUTCFullYear() !== y || d.getUTCMonth() !== Number(month) - 1 || d.getUTCDate() !== Number(day)) return '';
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  function mrzDate(value) {
    if (!/^\d{6}$/.test(value)) return '';
    const year = Number(value.slice(0, 2));
    const now = new Date().getUTCFullYear();
    const possible = [2000 + year, 2100 + year];
    const chosen = possible.find((candidate) => candidate >= now - 1 && candidate <= now + 35) || possible[0];
    return isoDate(value.slice(4, 6), value.slice(2, 4), chosen);
  }
  const MONTHS = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
  const THAI_MONTHS = { 'มค': 1, 'กพ': 2, 'มีค': 3, 'เมย': 4, 'พค': 5, 'มิย': 6, 'กค': 7, 'สค': 8, 'กย': 9, 'ตค': 10, 'พย': 11, 'ธค': 12 };
  function expiryIn(text) {
    const source = String(text || '').toUpperCase().replace(/[๐-๙]/g, (ch) => String(ch.charCodeAt(0) - 0x0E50));
    const dates = [];
    const add = (match, day, month, year) => {
      const date = isoDate(day, month, year);
      if (date) dates.push({ index: match.index, date });
    };
    for (const match of source.matchAll(/(\d{1,2})[\/\.\-\s]+(\d{1,2})[\/\.\-\s]+(\d{4})/g)) add(match, match[1], match[2], match[3]);
    for (const match of source.matchAll(/(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/g)) add(match, match[3], match[2], match[1]);
    for (const match of source.matchAll(/(\d{1,2})\s*([A-Z]{3})\.?\s*(\d{4})/g)) {
      if (MONTHS[match[2]]) add(match, match[1], MONTHS[match[2]], match[3]);
    }
    for (const match of source.matchAll(/(\d{1,2})\s*(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)\.?\s*(\d{4})/g)) {
      const month = THAI_MONTHS[match[2].replace(/\./g, '')];
      if (month) add(match, match[1], month, match[3]);
    }
    dates.sort((a, b) => a.index - b.index);
    for (const label of source.matchAll(/EXPIR(?:Y|ES|ATION)|VALID\s*(?:UNTIL|THRU|TO)|หมดอายุ/g)) {
      // On Thai ID cards the date is often printed above the label; on a
      // passport it is usually after it. Prefer the nearby date, either way.
      const after = dates.find((item) => item.index >= label.index + label[0].length && item.index <= label.index + label[0].length + 45);
      if (after) return after.date;
      const before = dates.filter((item) => item.index < label.index && item.index >= label.index - 75).at(-1);
      if (before) return before.date;
    }
    return '';
  }
  function parse(text) {
    const source = String(text || '').toUpperCase().replace(/[๐-๙]/g, (ch) => String(ch.charCodeAt(0) - 0x0E50));
    const lines = source.split(/\r?\n/).map((line) => line.replace(/\s/g, '')).filter(Boolean);
    const mrz = lines.find((line) => /^[A-Z0-9<]{40,46}$/.test(line) && /[A-Z]{3}\d{6}[0-9<][MF<]\d{6}/.test(line));
    if (mrz) {
      const passportNumber = mrz.slice(0, 9).replace(/</g, '');
      const expiry = mrzDate(mrz.slice(21, 27));
      if (/^[A-Z0-9]{6,10}$/.test(passportNumber) && expiry) return { type: 'passport', number: passportNumber, expiry, source: 'mrz' };
    }
    const ids = source.match(/(?:\d[\s\-]*){13}/g) || [];
    const id = ids.map((value) => value.replace(/\D/g, '')).find(thaiIdValid);
    if (id) return { type: 'thai_id', number: id, expiry: expiryIn(source), source: 'printed' };
    const passportMatch = source.match(/(?:PASSPORT\s*(?:NO\.?|NUMBER)?|เลขที่หนังสือเดินทาง)[\s:#.\-]*([A-Z0-9]{6,10})/i);
    if (passportMatch) return { type: 'passport', number: passportMatch[1], expiry: expiryIn(source), source: 'printed' };
    return { type: '', number: '', expiry: '', source: '' };
  }
  function loadScript() {
    if (library) return library;
    library = new Promise((resolve, reject) => {
      if (global.Tesseract) return resolve(global.Tesseract);
      const script = document.createElement('script');
      script.src = new URL('tesseract.min.js', base).href;
      script.onload = () => global.Tesseract ? resolve(global.Tesseract) : reject(new Error('ocr_library_unavailable'));
      script.onerror = () => reject(new Error('ocr_library_unavailable'));
      document.head.appendChild(script);
    }).catch((error) => { library = null; throw error; });
    return library;
  }
  async function recognize(file, onProgress) {
    if (!file || !/^image\//.test(file.type)) throw new Error('ocr_invalid_image');
    const tesseract = await loadScript();
    if (!worker) worker = tesseract.createWorker('eng+tha', 1, {
      workerPath: new URL('worker.min.js', base).href,
      corePath: new URL('tesseract-core-lstm.wasm.js', base).href,
      langPath: base.href.replace(/\/$/, ''),
      workerBlobURL: false,
      cacheMethod: 'none',
      logger: (event) => { if (onProgress && event.status === 'recognizing text') onProgress(event.progress); }
    }).catch((error) => { worker = null; throw error; });
    const instance = await worker;
    const result = await instance.recognize(file);
    return parse(result.data?.text || '');
  }
  const api = { parse, recognize, thaiIdValid };
  global.AJIdentityOCR = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
