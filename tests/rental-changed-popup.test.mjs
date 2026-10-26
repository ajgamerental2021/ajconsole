import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name, async = false) {
  const marker = `  ${async ? 'async ' : ''}function ${name}(`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  }', start) + 4);
}
function constant(name) {
  const start = source.indexOf(`  const ${name} = `);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf(';\n', start) + 2);
}
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function setup(lang = 'th') {
  const code = 'AJ-20261018-R0031';
  const calc = {consoleId:'PS5', start:'2026-10-20', end:'2026-10-23', bundleId:'', extras:[], boardgames:[],
    games:[{id:'g1', nameTh:'เกมหนึ่ง', nameEn:'Game One'}], later:false, ret:true, retVerified:true,
    reviewGoogle:false, reviewFacebook:false, noContract:false,
    rentalCode:code, demoOrderCode:code, demoOrderOpen:true, rentalCodeSig:'', confirmedRental:null};
  const state = {lang, calc, bundles:[]};
  const modal = {};
  let saves = 0, closed = 0;
  const ctx = vm.createContext({state, esc, JSON, Object, Array, String,
    CONFIG:{lineOaMessageUrl:'https://line.me/R/oaMessage/@ajgame/'},
    consoleById:(id) => ({PS5:{name:'PS5 Slim', nameEn:'PS5 Slim'}, NSW:{name:'Switch 2', nameEn:'Switch 2'}}[id]),
    displayDate:(v) => v ? v.split('-').reverse().join('/') : '-',
    consoleHasGameCatalog:() => true, calcSummary:() => ({}),
    saveLocal(){ saves++; }, render(){}, closeModal(){ closed++; },
    showModal(title, body){ modal.title = title; modal.body = body; }});
  vm.runInContext(fn('rentalSignature') + fn('reconcileConfirmedIdentitySignature')
    + constant('CONFIRMED_RENTAL_FIELDS') + fn('confirmedRentalSnapshot') + constant('gameKey')
    + fn('snapshotValueKey') + fn('confirmedRentalChanges') + fn('confirmedRentalChangeRows')
    + constant('VERIFIED_ONLY_FIELDS') + fn('restoreConfirmedRental')
    + 'let rentalChangedRetry = null;' + fn('showRentalChangedPopup') + fn('useConfirmedRentalAndRetry', true)
    + fn('confirmedRentalCodeForPayment'), ctx);
  // Step 3 confirmed: the Rental ID and what it was issued for.
  calc.rentalCodeSig = ctx.rentalSignature();
  calc.confirmedRental = ctx.confirmedRentalSnapshot();
  return {ctx, state, calc, code, modal, counts:() => ({saves, closed})};
}

test('nothing chosen has changed: a signature built differently after a reload still pays', () => {
  const {ctx, calc, code} = setup();
  calc.rentalCodeSig = 'built-by-an-older-page';
  assert.equal(ctx.confirmedRentalCodeForPayment({}), code);
  assert.equal(calc.rentalCodeSig, ctx.rentalSignature());
});

test('the popup says what changed and how to fix it, in Thai and English', () => {
  for (const lang of ['th', 'en']) {
    const {ctx, calc, modal} = setup(lang);
    calc.end = '2026-10-24';
    calc.consoleId = 'NSW';
    assert.throws(() => ctx.confirmedRentalCodeForPayment({}), /rental_details_changed/);
    ctx.showRentalChangedPopup(() => {});
    if (lang === 'th') {
      assert.equal(modal.title, 'รายละเอียดการเช่าไม่ตรงกับที่ยืนยันไว้');
      assert.match(modal.body, /วันคืน<\/b>: ที่ยืนยันไว้ <b>23\/10\/2026<\/b> → ตอนนี้ <b>24\/10\/2026/);
      assert.match(modal.body, /เครื่อง<\/b>: ที่ยืนยันไว้ <b>PS5 Slim<\/b> → ตอนนี้ <b>Switch 2/);
      assert.match(modal.body, /วิธีแก้ไข/);
      assert.match(modal.body, /ใช้รายละเอียดที่ยืนยันไว้/);
      assert.match(modal.body, /ทักร้านทาง LINE/);
    } else {
      assert.equal(modal.title, 'Your rental details changed');
      assert.match(modal.body, /Return date<\/b>: confirmed <b>23\/10\/2026<\/b> → now <b>24\/10\/2026/);
      assert.match(modal.body, /How to fix it/);
      assert.match(modal.body, /Use the confirmed details/);
      assert.match(modal.body, /Message AJ on LINE/);
    }
    assert.match(modal.body, /AJ-20261018-R0031/);
  }
});

test('“use the confirmed details” puts the rental back and carries on to payment', async () => {
  const {ctx, calc, code, counts} = setup();
  calc.end = '2026-10-24';
  calc.games = [];
  let paid = 0;
  ctx.showRentalChangedPopup(() => { paid++; });
  await ctx.useConfirmedRentalAndRetry();
  assert.equal(calc.end, '2026-10-23');
  assert.equal(calc.games[0].id, 'g1');
  assert.equal(ctx.confirmedRentalCodeForPayment({}), code);
  assert.equal(paid, 1, 'payment is tried again straight away');
  assert.equal(counts().closed, 1);
});

test('a returning-customer discount dropped on reload is not restored without verifying again', async () => {
  const {ctx, calc, modal} = setup();
  // What the page does on reload when the verification no longer matches this device.
  calc.retVerified = false;
  calc.ret = false;
  ctx.showRentalChangedPopup(() => {});
  assert.match(modal.body, /ส่วนลดลูกค้าเก่า<\/b>: ที่ยืนยันไว้ <b>ใช่<\/b> → ตอนนี้ <b>ไม่/);
  assert.match(modal.body, /data-rental-changed-verify/);
  let paid = 0;
  ctx.showRentalChangedPopup(() => { paid++; });
  await ctx.useConfirmedRentalAndRetry();
  assert.equal(calc.ret, false, 'the discount needs the verification');
  assert.equal(paid, 0, 'still not payable, so the popup stays');
  // Verified again: everything matches and payment goes ahead.
  calc.retVerified = true;
  calc.ret = true;
  assert.ok(ctx.confirmedRentalCodeForPayment({}));
});

test('every place that hit the old message now opens the popup', () => {
  assert.match(source, /showRentalChangedPopup\(\(\) => confirmDemoOrder\(\)\)/);
  assert.match(source, /showRentalChangedPopup\(\(\) => launchDemoBeamPayment\(\)\)/);
  assert.match(source, /showRentalChangedPopup\(\(\) => notifyDemoLine\(\)\)/);
  assert.doesNotMatch(source, /ระบบไม่ได้สร้างรหัสการเช่าใหม่/);
  assert.match(source, /state\.calc\.confirmedRental = confirmedRentalSnapshot\(\);/);
  assert.match(source, /\[data-rental-changed-restore\]/);
});

test('an unpaid accessory edit is persisted before payment without replacing the Rental ID', async () => {
  const {ctx, calc, code} = setup('en');
  calc.demoContextToken = 'private-context';
  calc.extras = ['controller'];
  let posted;
  Object.assign(ctx, {
    showDemoBusy(){},
    fetchAvailability: async () => ({fresh:true}),
    hasRecentAvailabilitySnapshot: () => true,
    evaluateAvailability: () => ({pass:true}),
    ensureBookingHold: async () => {},
    queueConsolePendingUpsert: async () => {},
    calcRentalContext: () => ({}),
    calcSummary: () => ({}),
    bookingStructured: () => ({rentalCode:code, extras:['Controller'], total:'฿3,500'}),
    rentalSheetPayload: () => ({row:{'รหัสการเช่า':code}}),
    bookingMessage: () => 'updated',
    bookingFetch: async (_url, init) => { posted = JSON.parse(init.body); return {ok:true, json:async () => ({rental:{rentalCode:code}})}; },
    renderDemoOrderPage(){},
  });
  ctx.state.availability = {error:''};
  vm.runInContext('let consolePendingWrites = Promise.resolve();' + fn('saveChangedOrderBeforePayment', true), ctx);
  await ctx.saveChangedOrderBeforePayment();
  assert.equal(posted.contextToken, 'private-context');
  assert.equal(posted.rentalCode, code);
  assert.deepEqual(posted.data.extras, ['Controller']);
  assert.equal(ctx.confirmedRentalCodeForPayment({}), code);
});

test('an expired booking context is renewed once before saving the changed order', async () => {
  const {ctx, calc, code} = setup('th');
  calc.demoContextToken = 'old-context';
  calc.extras = ['controller'];
  let attempts = 0;
  let handoffs = 0;
  let refreshedQuote = false;
  Object.assign(ctx, {
    consolePendingRental:null,
    showDemoBusy(){}, fetchAvailability:async () => ({fresh:true}),
    hasRecentAvailabilitySnapshot:() => true, evaluateAvailability:() => ({pass:true}),
    ensureBookingHold:async () => {}, queueConsolePendingUpsert:async () => {},
    calcRentalContext:() => ({}), calcSummary:() => ({}),
    bookingStructured:() => ({rentalCode:code, extras:[]}),
    rentalSheetPayload:() => ({row:{'รหัสการเช่า':code}}), bookingMessage:() => 'updated',
    bookingFetch:async (_url, init) => {
      attempts++;
      const sent = JSON.parse(init.body);
      if(attempts === 1){
        assert.equal(sent.contextToken, 'old-context');
        return {status:404, ok:false, json:async () => ({error:'link_invalid'})};
      }
      assert.equal(sent.contextToken, 'new-context');
      return {status:200, ok:true, json:async () => ({rental:{rentalCode:code}})};
    },
    prepareContractHandoff:async () => {
      handoffs++;
      if(handoffs === 1) throw Object.assign(new Error('delivery_quote_required'), {code:'delivery_quote_required'});
      return {contextToken:'new-context'};
    },
    ensureDemoDeliveryQuote:async force => { refreshedQuote = force === true; },
    renderDemoOrderPage(){},
  });
  ctx.state.availability = {error:''};
  vm.runInContext('let consolePendingWrites = Promise.resolve();' + fn('saveChangedOrderBeforePayment', true), ctx);
  await ctx.saveChangedOrderBeforePayment();
  assert.equal(attempts, 2);
  assert.equal(handoffs, 2);
  assert.equal(refreshedQuote, true);
  assert.equal(calc.demoContextToken, 'new-context');
});
