import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function sourceBetween(start, end) {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Could not find ${start}`);
  return html.slice(from, to);
}

test('choosing the lower deposit unlocks identity photos and cancel restores the previous choice', () => {
  const profile = { identitySkipped: true, fullName: 'Test Renter' };
  const state = { calc: { noContract: true, demoIdentitySkipped: true, beamPaymentLink: 'old-link', beamPaymentKey: 'old-key', beamPaymentExpiresAt: 'old-expiry' } };
  const delivery = { status: 'ready' };
  let modalOpenedWithUploadsEnabled = false;
  const context = {
    demoProfile: profile,
    state,
    demoDelivery: delivery,
    render() {},
    openVerifyNowModal() { modalOpenedWithUploadsEnabled = !profile.identitySkipped && !state.calc.noContract; },
    byId() { return { focus() {}, classList: { remove() {} } }; },
    returnAgreementCard() {},
    returnCustomerCard() {},
    saveDemoProfile() {},
    saveLocal() {},
    window: {},
    Object,
    JSON,
  };
  const source = `let verifyForDepositActive = false; let verifyForDepositSnapshot = null;\n${sourceBetween('  function openDemoVerifyForDeposit(){', '  // "No verification":')}\n${sourceBetween('  function closeModal(){', '  function loadLineSdk(){')}\nglobalThis.isUpgradeOpen = () => verifyForDepositActive;`;
  runInNewContext(source, context);
  context.openDemoVerifyForDeposit();
  assert.equal(modalOpenedWithUploadsEnabled, true);
  assert.equal(profile.identitySkipped, false);
  assert.equal(state.calc.demoIdentitySkipped, false);
  assert.equal(context.isUpgradeOpen(), true);
  context.closeModal();
  assert.equal(profile.identitySkipped, true);
  assert.equal(state.calc.noContract, true);
  assert.equal(state.calc.demoIdentitySkipped, true);
  assert.equal(state.calc.beamPaymentLink, 'old-link');
  assert.equal(context.isUpgradeOpen(), false);
});

test('verification modal upload controls ignore an old Verify later flag', () => {
  const grid = sourceBetween('  function demoIdentityUploadGridHtml(prefix){', '  function renderDemoIdentityCard(){');
  assert.match(grid, /uploadDisabled = demoProfile\.identitySkipped && !verifyForDepositActive/);
  assert.match(grid, /keptNotice = uploadDisabled &&/);
  assert.equal((grid.match(/uploadDisabled\?"disabled":""/g) || []).length, 4);
  assert.doesNotMatch(html, /\.demo-camera-input\{display:none\}/);
});
