import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/identity-ocr.js', import.meta.url), 'utf8');
const context = { URL, module: { exports: {} } };
vm.runInNewContext(source, context);
const { parse } = context.module.exports;
const id = '1234567890121'; // Synthetic number with a valid check digit.

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
