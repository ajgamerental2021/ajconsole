import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const bookingPage = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const quotePage = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');
const bookingRule = bookingPage.slice(
  bookingPage.indexOf('const FIVE_THOUSAND_DEPOSIT_IDS ='),
  bookingPage.indexOf('function consoleById(', bookingPage.indexOf('const FIVE_THOUSAND_DEPOSIT_IDS =')),
);
const quoteRule = quotePage.slice(
  quotePage.indexOf('function noIdDepositFor('),
  quotePage.indexOf('function ', quotePage.indexOf('function noIdDepositFor(') + 1),
);
const bookingDeposit = runInNewContext(`${bookingRule}\nnoContractDeposit`);
const quoteDeposit = runInNewContext(`${quoteRule}\nnoIdDepositFor`);

const special = [
  ['1', 'PS4'], ['2', 'PS Portal'], ['4', 'Nintendo Switch 1'], ['5', 'XBOX Series S'],
];

test('main booking and quick quote agree on the four 5,000 deposit models', () => {
  for (const [id, name] of special) {
    const main = { id, name, nameEn: name };
    const quote = { id: ({ '1': 'ps4', '2': 'ps-portal', '4': 'switch-1', '5': 'xbox-series-s' })[id], nameEn: name };
    assert.equal(bookingDeposit(2000, main), 5000, name);
    assert.equal(quoteDeposit(2000, false, quote), 5000, name);
  }
  assert.equal(bookingDeposit(2000, { id: '11', nameEn: 'PS5' }), 10000);
  assert.equal(quoteDeposit(2000, false, { id: 'ps5', nameEn: 'PS5' }), 10000);
  assert.equal(bookingDeposit(4000, { id: '18', nameEn: 'PS5 Pro' }), 15000);
  assert.equal(quoteDeposit(2000, true, { id: 'ps5', nameEn: 'PS5' }), 15000);
});

test('Step 2, FAQ and rental steps explain the four models in both languages', () => {
  for (const name of ['PS4', 'Nintendo Switch 1', 'XBOX Series S', 'PS Portal']) {
    assert.match(bookingPage, new RegExp(name), name);
  }
  assert.match(bookingPage, /noContractHelp:"[^"\n]*฿2,000 → ฿5,000/);
  assert.match(bookingPage, /noContractHelp:"[^"\n]*other ฿2,000 deposits → ฿10,000/);
  assert.match(bookingPage, /ไม่ยืนยันตัวตน: PS4, Nintendo Switch 1, XBOX Series S และ PS Portal: ฿2,000 → ฿5,000/);
  assert.match(bookingPage, /No identity verification: PS4, Nintendo Switch 1, XBOX Series S and PS Portal: ฿2,000 → ฿5,000/);
});
