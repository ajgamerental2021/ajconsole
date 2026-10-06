import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/identity-ocr.js', import.meta.url), 'utf8');
const context = { URL, module: { exports: {} } };
vm.runInNewContext(source, context);
const { parse, cardBounds } = context.module.exports;
const id = '1234567890121'; // Synthetic number with a valid check digit.

test('browser OCR uses sparse-text segmentation for a small ID on a larger photo', () => {
  assert.match(source, /recognize\(input, \{ tessedit_pageseg_mode: '11' \}\)/);
  assert.match(source, /for \(const input of \[\.\.\.crops, file\]\)/);
});

for (const [label, text] of [
  ['Thai date after label', `เลขประจำตัวประชาชน ${id}\nวันหมดอายุ 5 ก.ค. 2576`],
  ['Thai date above label', `เลขประจำตัวประชาชน ${id}\n14 ส.ค. 2567    5 ก.ค. 2576\nวันออกบัตร    วันหมดอายุ`],
  ['English date above label', `Identification Number ${id}\n14 Aug. 2024    5 Jul. 2033\nDate of Issue    Date of Expiry`],
]) {
  test(`OCR reads ${label}`, () => {
    const result = parse(text);
    assert.equal(result.number, id);
    assert.equal(result.expiry, '2033-07-05');
  });
}

test('OCR leaves a passport Common Era expiry year unchanged', () => {
  const result = parse('Passport No. AB1234567\nDate of Expiry 5 Jul. 2033');
  assert.equal(result.type, 'passport');
  assert.equal(result.number, 'AB1234567');
  assert.equal(result.expiry, '2033-07-05');
});

test('OCR preserves an expiry read separately from the document number', () => {
  const result = parse('Date of Expiry 5 Jul. 2033');
  assert.equal(result.number, '');
  assert.equal(result.expiry, '2033-07-05');
});

test('OCR tolerates one spurious Thai letter in a printed expiry month', () => {
  const result = parse(`Identification Number ${id}\n5 ก . ด ค . 2576\nDate of Expiry`);
  assert.equal(result.number, id);
  assert.equal(result.expiry, '2033-07-05');
});

test('OCR crops a blue ID card and ignores a handwritten note below it', () => {
  const width = 240;
  const height = 300;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const card = x >= 35 && x < 205 && y >= 30 && y < 125;
      const ink = x >= 25 && x < 210 && y >= 190 && y < 193;
      [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]] =
        card ? [120, 170, 195, 255] : ink ? [30, 60, 170, 255] : [235, 225, 205, 255];
    }
  }
  const bounds = cardBounds(data, width, height);
  assert.ok(bounds);
  assert.ok(bounds.x <= 35);
  assert.ok(bounds.y <= 30);
  assert.ok(bounds.x + bounds.width >= 205);
  assert.ok(bounds.y + bounds.height >= 125);
  assert.ok(bounds.y + bounds.height < 190);
});
