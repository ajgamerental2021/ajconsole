import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const page = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const section = page.slice(page.indexOf('  const LINE_DRAFT_CALC_FIELDS = '), page.indexOf('  function launchLineConnection('));
const profileFields = vm.runInNewContext(page.match(/const DEMO_PROFILE_FIELDS = (\[[^\n]+\]);/)[1]);

for (const language of ['th', 'en']) {
  test(`the ${language} booking draft restores every entered field in separate browser storage`, async () => {
    const originalCalc = {
      step:2,type:'console',consoleId:'switch-1',start:'2026-11-25',end:'2026-11-28',datesTouched:true,
      bundleId:'family',extras:['controller','wheel'],boardgames:['catan'],games:[{id:'game-1',name:'Game'}],later:false,
      ret:true,retVerified:true,retVerificationMethod:'manual',retVerificationToken:'signed-returning-token',
      reviewGoogle:true,reviewFacebook:true,noContract:true,rentalTermsAccepted:true,rentalTermsVersion:'v1',
    };
    const originalProfile = {
      fullName:'Test Customer',phone:'0812345678',email:'customer@example.com',maps:'https://maps.google.com/?q=1',
      deliveryInstructions:'Gate 2',deliveryNotes:[{location:'Gate 2',note:'Call first'}],
      refundBankId:'bank-a',refundAccountName:'Test Customer',refundDeferred:true,termsAccepted:true,identitySkipped:true,
    };
    const saved = new Map();
    let serverDraft;
    const context = {
      state:{lang:language,calc:{...originalCalc}}, demoProfile:{...originalProfile},
      demoAgreement:{account:'1234567890',wise:{payout:'bank',wiseEmail:'wise@example.com',wiseAccountNumber:'987654321'}},
      demoReturningBankName:'Bank A',demoReturningBaseline:'verified-customer',demoContactFromLine:true,
      DEMO_PROFILE_FIELDS:profileFields, URL, CONFIG:{contractWebUrl:'https://bot.example.com'},
      sessionStorage:{setItem:(key,value)=>saved.set(key,value),getItem:key=>saved.get(key)||null,removeItem:key=>saved.delete(key)},
      saveLocal(){}, saveDemoProfile(){},
      bookingFetch:async (url, options) => {
        if(options.method === 'PUT') { serverDraft=JSON.parse(options.body); return {ok:true}; }
        assert.match(String(url),/\/draft$/);
        assert.equal(options.headers['X-Line-Resume-Key'],'r'.repeat(43));
        return {ok:true,json:async()=>({ok:true,draft:serverDraft})};
      },
    };
    vm.runInNewContext(`${section}\nthis.api={saveLineBookingDraft,restoreLineBookingDraft,lineBookingDraft,setReturn:resume=>lineDraftReturn=resume};`,context);
    await context.api.saveLineBookingDraft({id:'i'.repeat(43),pollKey:'p'.repeat(43)});
    assert.equal(serverDraft.calc.bundleId,'family');
    assert.equal(serverDraft.calc.reviewFacebook,true);
    assert.equal(serverDraft.profile.deliveryInstructions,'Gate 2');
    assert.equal(serverDraft.refund.account,'1234567890');
    assert.equal(JSON.stringify(serverDraft).includes('identityNumber'),false);
    context.state.calc={step:1};context.demoProfile={};context.demoAgreement.account='';context.demoAgreement.wise={payout:'bank',wiseEmail:'',wiseAccountNumber:''};
    context.api.setReturn({id:'i'.repeat(43),key:'r'.repeat(43)});
    assert.equal(await context.api.restoreLineBookingDraft(),true);
    for(const key of ['consoleId','start','end','bundleId','extras','boardgames','games','retVerified','retVerificationToken','reviewGoogle','reviewFacebook','noContract','rentalTermsAccepted'])
      assert.deepEqual(JSON.parse(JSON.stringify(context.state.calc[key])),originalCalc[key],key);
    for(const key of ['fullName','phone','email','maps','deliveryInstructions','deliveryNotes','refundBankId','refundAccountName','refundDeferred','termsAccepted','identitySkipped'])
      assert.deepEqual(JSON.parse(JSON.stringify(context.demoProfile[key])),originalProfile[key],key);
    assert.equal(context.demoAgreement.account,'1234567890');
    assert.equal(context.demoAgreement.wise.wiseEmail,'wise@example.com');
    assert.equal(saved.size,0);
  });
}
