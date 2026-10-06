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
    for (const match of source.matchAll(/(\d{1,2})\s*([ก-ฮ][\s.ก-ฮ]{0,8}?[ก-ฮ])\s*\.?\s*(\d{4})/g)) {
      const letters = match[2].replace(/[^ก-ฮ]/g, '');
      // Tiny Thai month abbreviations often gain one stray OCR character,
      // e.g. ก.ค. becomes ก.ดค. Keep the first and last letter in that case.
      const month = THAI_MONTHS[letters]
        || (letters.length === 3 ? THAI_MONTHS[letters[0] + letters[2]] : undefined);
      if (month) add(match, match[1], month, match[3]);
    }
    dates.sort((a, b) => a.index - b.index);
    const today = new Date().toISOString().slice(0, 10);
    const future = dates.filter((item) => item.date >= today && item.date <= `${new Date().getUTCFullYear() + 35}-12-31`);
    for (const label of source.matchAll(/EXPIR(?:Y|ES|ATION)|VALID\s*(?:UNTIL|THRU|TO)|หมดอายุ/g)) {
      // On Thai ID cards the date is often printed above the label; on a
      // passport it is usually after it. Prefer the nearby date, either way.
      const after = dates.find((item) => item.index >= label.index + label[0].length && item.index <= label.index + label[0].length + 45);
      if (after && after.date >= today) return after.date;
      const before = dates.filter((item) => item.index < label.index && item.index >= label.index - 75).at(-1);
      if (before && before.date >= today) return before.date;
    }
    // The tiny expiry caption is often lost even when its date survives OCR.
    // Never mistake the card's issue date or date of birth for its expiry.
    return future.sort((a, b) => b.date.localeCompare(a.date))[0]?.date || '';
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
    // A second OCR pass may find the document number even when this pass only
    // reads the expiry. Keep that partial result so the passes can be combined.
    return { type: '', number: '', expiry: expiryIn(source), source: '' };
  }
  function cardBounds(data, width, height) {
    // Thai ID cards have a blue face. The paper in customers' photos is often
    // much larger than the card, and handwritten notes below it must not set
    // the OCR scale. Find the broad blue rectangle, not isolated blue ink.
    const blue = (offset) => data[offset + 2] > data[offset] + 8
      && data[offset + 1] >= data[offset] - 12;
    const density = new Array(height).fill(0);
    for (let y = 0; y < height; y++) {
      let count = 0;
      for (let x = 0; x < width; x++) {
        if (blue((y * width + x) * 4)) count++;
      }
      density[y] = count / width;
    }
    const maxGap = Math.max(3, Math.round(height * 0.035));
    const bands = [];
    let start = -1;
    let last = -1;
    for (let y = 0; y <= height; y++) {
      if (y < height && density[y] >= 0.12) {
        if (start < 0) start = y;
        last = y;
      } else if (start >= 0 && (y === height || y - last > maxGap)) {
        bands.push({ start, end: last + 1 });
        start = last = -1;
      }
    }
    const band = bands.sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
    if (!band || band.end - band.start < height * 0.1) return null;
    const columns = [];
    for (let x = 0; x < width; x++) {
      let count = 0;
      for (let y = band.start; y < band.end; y++) {
        if (blue((y * width + x) * 4)) count++;
      }
      if (count / (band.end - band.start) >= 0.08) columns.push(x);
    }
    if (!columns.length) return null;
    const left = columns[0];
    const right = columns.at(-1) + 1;
    const xMargin = Math.round((right - left) * 0.08);
    const yMargin = Math.round((band.end - band.start) * 0.07);
    const x = Math.max(0, left - xMargin);
    const y = Math.max(0, band.start - yMargin);
    const w = Math.min(width, right + xMargin) - x;
    const h = Math.min(height, band.end + yMargin) - y;
    const ratio = w / h;
    if (ratio < 1.2 || ratio > 2.3 || w * h > width * height * 0.8) return null;
    return { x, y, width: w, height: h };
  }
  async function cardCrops(file) {
    if (typeof document === 'undefined') return [];
    let image;
    let objectUrl;
    try {
      if (typeof createImageBitmap === 'function') {
        try { image = await createImageBitmap(file); } catch (_) { /* Safari image fallback below. */ }
      }
      if (!image) {
        objectUrl = URL.createObjectURL(file);
        image = await new Promise((resolve, reject) => {
          const element = new Image();
          element.onload = () => resolve(element);
          element.onerror = reject;
          element.src = objectUrl;
        });
      }
      const sourceWidth = image.width;
      const sourceHeight = image.height;
      const sampleWidth = Math.min(360, sourceWidth);
      const sampleHeight = Math.max(1, Math.round(sourceHeight * sampleWidth / sourceWidth));
      const sample = document.createElement('canvas');
      sample.width = sampleWidth;
      sample.height = sampleHeight;
      const sampleContext = sample.getContext('2d', { willReadFrequently: true });
      sampleContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
      const bounds = cardBounds(sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data, sampleWidth, sampleHeight);
      if (!bounds) return [];
      const x = Math.round(bounds.x * sourceWidth / sampleWidth);
      const y = Math.round(bounds.y * sourceHeight / sampleHeight);
      const width = Math.round(bounds.width * sourceWidth / sampleWidth);
      const height = Math.round(bounds.height * sourceHeight / sampleHeight);
      // Tesseract already chooses its own text scale. Enlarging this sample
      // blurred the tiny expiry date enough to make it unreadable.
      const scale = Math.min(1, 2200 / width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext('2d');
      context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
      // A modest JPEG recompression helps Tesseract separate the tiny Thai
      // month letters on actual phone photos. Raw canvas/PNG read the issue
      // date instead of the expiry on the reported sample.
      const encode = (source, type, quality) => new Promise((resolve, reject) => {
        source.toBlob((blob) => blob ? resolve(blob) : reject(new Error('ocr_crop_encode_failed')), type, quality);
      });
      // Read the whole card for the number, then the lower-right date zone
      // independently so the issue date printed on the left cannot win.
      const expiry = document.createElement('canvas');
      expiry.width = Math.round(canvas.width * 0.57);
      expiry.height = Math.round(canvas.height * 0.48);
      expiry.getContext('2d').drawImage(canvas,
        Math.round(canvas.width * 0.43), Math.round(canvas.height * 0.52),
        Math.round(canvas.width * 0.57), Math.round(canvas.height * 0.48),
        0, 0, expiry.width, expiry.height);
      return [await encode(canvas, 'image/jpeg', 0.8), await encode(expiry, 'image/jpeg', 0.88), await encode(canvas, 'image/png')];
    } finally {
      if (image && typeof image.close === 'function') image.close();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
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
    let crops = [];
    try { crops = await cardCrops(file); } catch (_) { /* Keep the original-photo fallback. */ }
    let found = { type: '', number: '', expiry: '', source: '' };
    const today = new Date().toISOString().slice(0, 10);
    // A single canvas encoding can fail in Safari or change the tiny Thai
    // characters. Continue through the other variants and the original file.
    let lastError;
    for (const input of [...crops, file]) {
      let result;
      try { result = await instance.recognize(input, { tessedit_pageseg_mode: '11' }); }
      catch (error) { lastError = error; continue; }
      const current = parse(result.data?.text || '');
      if (current.number && !found.number) {
        found = { ...found, type: current.type, number: current.number, source: current.source };
      }
      if (current.expiry && (!found.expiry || (found.expiry < today && current.expiry >= today))) {
        found.expiry = current.expiry;
      }
      if (found.number && found.expiry >= today) break;
    }
    if (!found.number && !found.expiry && lastError) throw lastError;
    return found;
  }
  const api = { parse, recognize, thaiIdValid, cardBounds };
  global.AJIdentityOCR = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
