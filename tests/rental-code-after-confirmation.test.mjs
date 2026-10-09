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

test('the payment step keeps the confirmed Rental ID in both languages', () => {
  for (const lang of ['th', 'en']) {
    const state = {lang, calc: {demoOrderOpen:true, demoOrderCode:'AJ-20261006-R0060', rentalCode:'AJ-20261006-R0060', rentalCodeSig:'same', demoAgreementFor:'AJ-20261006-R0060', demoIdentityFor:'AJ-20261006-R0060'}};
    const ctx = vm.createContext({state, rentalSignature:()=> 'same'});
    vm.runInContext(fn('confirmedRentalCodeForPayment'), ctx);
    assert.equal(ctx.confirmedRentalCodeForPayment({}), 'AJ-20261006-R0060');
    state.calc.rentalCode = 'AJ-20261006-R0070';
    state.calc.rentalCodeSig = 'same';
    assert.throws(()=>ctx.confirmedRentalCodeForPayment({}), /rental_details_changed/);
    state.calc.rentalCode = 'AJ-20261006-R0060';
    state.calc.rentalCodeSig = 'changed';
    assert.throws(()=>ctx.confirmedRentalCodeForPayment({}), /rental_details_changed/);
  }
  const checkout = source.slice(source.indexOf('  async function launchDemoBeamPayment(){'), source.indexOf('  // The pay-later email:'));
  assert.match(checkout, /const code = confirmedRentalCodeForPayment\(summary\)/);
  assert.doesNotMatch(checkout, /await ensureRentalCode\(summary\)/);
  assert.match(checkout, /This rental changed after confirmation/);
  assert.match(checkout, /รายละเอียดการเช่าเปลี่ยนหลังยืนยัน/);
});

test('an older preview request cannot replace an identity or agreement Rental ID', async () => {
  let finish, allocations = 0;
  const state = {calc:{rentalCode:'AJ-20261006-R0060', rentalCodeSig:'old', demoOrderOpen:false, demoOrderCode:'', demoIdentityFor:''}};
  const ctx = vm.createContext({state, calcSummary:()=>({}), rentalSignature:()=> 'new',
    nextRentalCode:()=>{allocations++; return new Promise(resolve=>{finish=resolve;});},
    saveLocal(){}, renderSummary(){}, SESSION_RENTAL_CODES:new Set(), localStorage:{getItem:()=>null}});
  vm.runInContext('let rentalCodeRequest=null;'+fn('allocateRentalCodeForDraft', true),ctx);
  const request = ctx.allocateRentalCodeForDraft();
  state.calc.demoIdentityFor = 'AJ-20261006-R0060';
  finish('AJ-20261006-R0070');
  await assert.rejects(request, /rental_details_changed/);
  assert.equal(state.calc.rentalCode,'AJ-20261006-R0060');
  await assert.rejects(ctx.allocateRentalCodeForDraft(), /rental_details_changed/);
  assert.equal(allocations,1);
});

test('switching identity choice on the confirmed order keeps its Rental ID, but another rental change is rejected', () => {
  for (const lang of ['th', 'en']) {
    const code = 'AJ-20261009-R0063';
    const state = {lang, calc:{consoleId:'N2', start:'2026-10-09', end:'2026-10-12', noContract:true,
      rentalCode:code, demoOrderCode:code, demoOrderOpen:true, rentalCodeSig:''}};
    const ctx = vm.createContext({state, demoProfile:{identitySkipped:true}, demoDelivery:{},
      calcSummary:()=>({}), consoleHasGameCatalog:()=>false,
      syncDemoNoContractAcceptance(){}, saveLocal(){}, render(){},
      pricingPolicy:{}, byId:()=>null});
    Object.assign(state.calc, {bundleId:'', extras:[], boardgames:[], games:[], ret:false, reviewGoogle:false, reviewFacebook:false});
    vm.runInContext(fn('rentalSignature') + fn('setDemoNoContract') + fn('openDemoVerifyForDeposit')
      + fn('confirmedRentalCodeForPayment'), ctx);
    state.calc.rentalCodeSig = ctx.rentalSignature();
    ctx.setDemoNoContract(false);
    assert.equal(ctx.confirmedRentalCodeForPayment({}), code);
    state.calc.start = '2026-10-10';
    assert.throws(() => ctx.confirmedRentalCodeForPayment({}), /rental_details_changed/);
  }
});
