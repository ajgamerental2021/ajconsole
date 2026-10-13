import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const booking = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const calculator = readFileSync(new URL('../quote/index.html', import.meta.url), 'utf8');

test('live quote marks outside-metro car delivery in calculator and checkout, in both languages', () => {
  for (const source of [booking, calculator]) {
    assert.match(source, /outsideBangkokMetro === true/);
    assert.match(source, /นอกพื้นที่กรุงเทพฯและปริมณฑล ใช้รถยนต์ขนส่งทุกกรณี/);
    assert.match(source, /Outside Bangkok and the surrounding provinces, both delivery trips use a car\./);
  }
  assert.match(calculator, /r\[3\] === 'delivery' && quote && quote\.outsideBangkokMetro === true/);
  assert.match(booking, /outsideMetroDeliveryNote\(quote, en\)/);
});
