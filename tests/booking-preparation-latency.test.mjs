import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('contract LIFF deep link keeps a path separator before its booking query', () => {
  assert.match(source, /contractUrl: "https:\/\/liff\.line\.me\/2010196202-iYu3RKIb\/"/);
});
function fn(name){
  const start=source.indexOf(`  async function ${name}(`);
  assert.ok(start>=0);
  return source.slice(start,source.indexOf('\n  }',start)+4);
}
test('a stalled optional message PATCH does not lose a usable context token', async()=>{
  const calls=[];
  const context=vm.createContext({URL,console,
    CONFIG:{contractWebUrl:'https://bot.example/liff/',contractUrl:'https://liff.line.me/example'},
    bookingStructured:()=>({lang:'EN'}),rentalContractLink:()=> 'https://bot.example/fallback',bookingMessage:()=> 'booking',
    bookingFetch:async(url,options)=>{
      calls.push(options.method);
      if(options.method==='PATCH') return new Promise(()=>{});
      return {ok:true,json:async()=>({contextToken:'valid-token'})};
    }
  });
  vm.runInContext(fn('prepareContractHandoff'),context);
  const result=await context.prepareContractHandoff('AJ-TEST');
  assert.equal(result.contextToken,'valid-token');
  assert.deepEqual(calls,['POST','PATCH']);
});
test('preview and checkout share one rental-code allocation', async()=>{
  let resolve, calls=0;
  const context=vm.createContext({calcSummary:()=>({}),rentalSignature:()=> 'same',
    allocateRentalCodeForDraft:()=>{calls++; return new Promise(r=>{resolve=r;});}
  });
  vm.runInContext('let rentalCodeRequest=null;'+fn('ensureRentalCode'),context);
  const first=context.ensureRentalCode(), second=context.ensureRentalCode();
  assert.equal(calls,1);
  resolve('AJ-TEST');
  assert.deepEqual(await Promise.all([first,second]),['AJ-TEST','AJ-TEST']);
});
test('successful allocator does not wait for historical sheet reads', async()=>{
  const context=vm.createContext({state:{calc:{}},calcSummary:()=>({}),rentalSignature:()=> 'same',
    nextRentalCode:async()=> 'AJ-TEST',saveLocal(){},renderSummary(){},
    existingRentalCodes:()=>{throw new Error('historical sheet must not block');}
  });
  vm.runInContext(fn('allocateRentalCodeForDraft'),context);
  assert.equal(await context.allocateRentalCodeForDraft(),'AJ-TEST');
});
