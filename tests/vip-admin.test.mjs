import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('VIP member PII is not embedded in the public booking page', () => {
  assert.doesNotMatch(html, /0905145645|0952509905|ตรีทิพย์ โรจน์ประเสริฐกุล|พฤทธิ เกษร/);
  assert.doesNotMatch(html, /const VIP_CUSTOMERS/);
});

test('Admin can load, add, edit, delete, and save VIP members server-side', () => {
  assert.match(html, /\/api\/admin\/vip-customers/);
  assert.match(html, /id="addVipCustomer"/);
  assert.match(html, /id="saveVipCustomers"/);
  assert.match(html, /data-vip-remove/);
  assert.match(html, /function readVipCustomersFromAdmin/);
});

test('VIP rules support all or selected deposit devices and per-device rental rates', () => {
  assert.match(html, /data-vip-field="depositAllDevices"/);
  assert.match(html, /data-vip-deposit-device/);
  assert.match(html, /data-vip-rate-daily/);
  assert.match(html, /data-vip-rate-weekly/);
  assert.match(html, /data-vip-rate-all/);
  assert.match(html, /vip\?\.deviceRates\?\.\["\*"\]/);
  assert.match(html, /vip\.depositAllDevices \|\| vip\.depositDeviceIds\.includes\(deviceId\)/);
});

test('normal visits start at Before rent while direct rental links keep their context', () => {
  assert.match(html, /state\.beforeRentActive = expiredRentalProgress \? false : !hasRentalContext\(\)/);
  assert.doesNotMatch(html, /body\.unified-flow-demo #beforeRentBack/);
  assert.match(html, /body\.unified-flow-demo \.demo-banner\{display:none!important\}/);
});
