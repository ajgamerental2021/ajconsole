import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = page.indexOf('function validDemoMapsLink(value){');
const end = page.indexOf('\n  function showReturningSaveProblem', start);
assert.ok(start > 0 && end > start);
const valid = Function(`${page.slice(start, end)}; return validDemoMapsLink;`)();

test('Step 2 accepts map links that the profile API can store', () => {
  for (const link of [
    'https://maps.app.goo.gl/abc123',
    'https://maps.google.com/?q=13.8,100.6',
    'https://www.google.com/maps/place/Bangkok',
    'https://google.com/maps/search/?api=1&query=Bangkok',
    'https://www.google.co.th/maps/place/Bangkok',
    'https://maps.apple.com/?ll=13.8,100.6',
  ]) assert.equal(valid(link), true, link);
  for (const link of [
    'https://example.com/maps/place/Bangkok',
    'https://www.google.com.evil.test/maps',
    'http://maps.google.com/?q=13.8,100.6',
    'https://www.google.com/search?q=Bangkok',
    'https://maps.app.goo.gl/',
    `https://maps.app.goo.gl/${'a'.repeat(501)}`,
  ]) assert.equal(valid(link), false, link);
});

test('a failed save offers a same-page fix, retry or renewed verification in both languages', () => {
  for (const text of ['แก้ไขช่องนี้', 'Edit this field', 'ลองบันทึกอีกครั้ง', 'Try saving again', 'ยืนยันสิทธิ์อีกครั้ง', 'Verify again']) {
    assert.ok(page.includes(text), text);
  }
  assert.match(page, /data-returning-save-retry/);
  assert.match(page, /data-returning-save-edit/);
  assert.match(page, /data-returning-save-verify/);
});

test('first-time LINE customers do not load a returning profile or need returning verification in either language', async () => {
  const eligibilityStart = page.indexOf('function detectLineReturningEligibility(existingLiff=null, existingProfile=null){');
  const eligibilityEnd = page.indexOf('\n  function historyKey(value){', eligibilityStart);
  const saveStart = page.indexOf('async function saveReturningProfileEdits(){');
  const saveEnd = page.indexOf('\n  const DEMO_CONTACT_IDS', saveStart);
  assert.ok(eligibilityStart > 0 && eligibilityEnd > eligibilityStart && saveStart > 0 && saveEnd > saveStart);
  const lineProfile = {userId:`U${'a'.repeat(32)}`, displayName:'First time'};
  for (const lang of ['th', 'en']) {
    let loadedReturningProfile = 0;
    let saveError = 0;
    let profileSaveRequest = 0;
    const state = {lang, calc:{ret:false, retVerified:false, retVerificationMethod:''}};
    const check = Function('deps', `with(deps){ ${page.slice(eligibilityStart, eligibilityEnd)}; return detectLineReturningEligibility; }`)({
      returningLineCheckPromise:null,
      UNIFIED_FLOW_DEMO:true,
      demoReturningRenewalBaseline:'',
      state,
      CONFIG:{returningEligibilityApi:'/eligibility'},
      localStorage:{setItem(){}},
      lineUniqueId:() => '',
      fetch:async () => ({ok:true,json:async () => ({eligible:false, profile:{fullName:'First time'}})}),
      applyDemoReturningProfile:() => { loadedReturningProfile++; },
      saveLocal:() => {}, render:() => {},
    });
    assert.equal(await check({isLoggedIn:() => true, getAccessToken:() => 'line-token', getProfile:async () => lineProfile}), false);
    assert.equal(loadedReturningProfile, 0, lang);
    assert.equal(state.calc.ret, false, lang);

    const deps = {
      state, demoReturningBaseline:'stale returning profile', demoReturningRenewalBaseline:'stale renewal',
      demoReturningSaving:false,
      showReturningSaveProblem:() => { saveError++; },
      fetch:async () => { profileSaveRequest++; throw new Error('unexpected returning save'); },
    };
    const save = Function('deps', `with(deps){ ${page.slice(saveStart, saveEnd)}; return saveReturningProfileEdits; }`)(deps);
    assert.equal(await save(), true, lang);
    assert.equal(deps.demoReturningBaseline, '', lang);
    assert.equal(deps.demoReturningRenewalBaseline, '', lang);
    assert.equal(saveError, 0, lang);
    assert.equal(profileSaveRequest, 0, lang);
  }
});
