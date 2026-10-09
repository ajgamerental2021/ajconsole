import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name, async = false) {
  const start = source.indexOf(`  ${async ? 'async ' : ''}function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  }', start) + 4);
}

test('a successful quote response without a price falls back so checkout can continue', async () => {
  const demoDelivery = {status:'idle', quote:null, key:'', error:''};
  const state = {calc:{demoOrderOpen:true, rentalCode:'AJ-20261009-R0063', extras:[]}, lang:'th'};
  const ctx = vm.createContext({demoDelivery, state, demoProfile:{maps:'pin'},
    demoDeliveryQuoteKey:()=> 'same', payResume:{active:false}, renderDemoOrderPage(){},
    bookingFetch:async()=>({ok:true, json:async()=>({ok:true, quote:null})}),
    URL, CONFIG:{apiBase:'https://example.test'}, demoAddressText:()=>'',
    deliveryNeedsCar:()=>false, calcSummary:()=>({days:3}),
    trackAnalytics(){}, queueConsolePendingUpsert(){}, maybeSendPayLaterEmail(){},
    setTimeout:(callback)=>{callback(); return 1;}, console:{warn(){}},
  });
  vm.runInContext(fn('fetchDemoDeliveryQuote', true) + fn('deliveryQuoteFallback'), ctx);
  await ctx.fetchDemoDeliveryQuote();
  assert.equal(demoDelivery.status, 'unavailable');
  assert.equal(ctx.deliveryQuoteFallback(), true);
});

test('a quote for an old delivery pin cannot replace or save the new pin quote', async () => {
  let finishFirst, calls = 0;
  const saved = [];
  const demoDelivery = {status:'idle', quote:null, key:'', error:''};
  const demoProfile = {maps:'pin-a'};
  const state = {calc:{demoOrderOpen:true, rentalCode:'AJ-20261009-R0063', extras:[]}, lang:'en'};
  const ctx = vm.createContext({demoDelivery, demoProfile, state,
    demoDeliveryQuoteKey:()=>demoProfile.maps, payResume:{active:false}, renderDemoOrderPage(){},
    bookingFetch:async()=>{calls++; return calls === 1 ? new Promise(resolve=>{finishFirst=resolve;})
      : {ok:true, json:async()=>({ok:true, quote:{subtotal:150,total:120}})};},
    URL, CONFIG:{apiBase:'https://example.test'}, demoAddressText:()=>'',
    deliveryNeedsCar:()=>false, calcSummary:()=>({days:3}),
    recordDemoDeliveryQuote:quote=>saved.push(quote),
    trackAnalytics(){}, queueConsolePendingUpsert(){}, maybeSendPayLaterEmail(){},
    setTimeout, console:{warn(){}},
  });
  vm.runInContext(fn('fetchDemoDeliveryQuote', true) + fn('deliveryQuoteFallback'), ctx);
  const pending = ctx.fetchDemoDeliveryQuote();
  demoProfile.maps = 'pin-b';
  finishFirst({ok:true, json:async()=>({ok:true, quote:{subtotal:999,total:999}})});
  await pending;
  assert.equal(calls, 2);
  assert.equal(demoDelivery.quote.total, 120);
  assert.deepEqual(saved.map(quote=>quote.total), [120]);
});
