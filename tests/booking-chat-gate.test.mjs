import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = page.slice(page.indexOf('  function lineBookingHandoffParams(){'), page.indexOf('  function lineBookingAppLinks('));

function runGateway({ ready = [false, true], context = 'utou', search, sendAllowed = true } = {}) {
  const original = 'https://ajgamerental.com/c/my?go=schedule&lang=en';
  const url = search || `?${new URLSearchParams({chatGate:'1', rentalCode:'AJ-20261012-R0011', lang:'en', next:original})}`;
  const status = { textContent:'' };
  const actions = { items:[], replaceChildren(){ this.items=[]; }, appendChild(item){ this.items.push(item); } };
  const sent = [];
  const redirects = [];
  const liff = { init:async()=>{}, isInClient:()=>true, getContext:()=>({type:context}),
    getAccessToken:()=> 'valid-token', sendMessages:async messages=>{sent.push(...messages);} };
  let checks = 0;
  const sandbox = {
    location:{search:url, replace:target=>redirects.push(target)}, URL, URLSearchParams, decodeURIComponent,
    document:{body:{innerHTML:''}, getElementById:id=>id==='chatGateStatus'?status:actions,
      createElement:()=>({style:{},addEventListener(){}})},
    CONFIG:{lineLiffId:'2010212481-IXO3gDQp',contractWebUrl:'https://aj-line-oa-bot.onrender.com/liff/'},
    loadLineSdk:async()=>liff, bookingWait:promise=>promise,
    bookingFetch:async()=>({ok:true,json:async()=>({ready:ready[Math.min(checks++,ready.length-1)],sendAllowed})}),
    setTimeout:fn=>{fn();return 1;}, clearTimeout:()=>{}, console,
  };
  vm.runInNewContext(`${source}\nthis.run=completeBookingChatGate;this.params=lineBookingHandoffParams;`,sandbox);
  return {sandbox, original, status, actions, sent, redirects, run:()=>sandbox.run()};
}

test('first click sends one customer message, waits for signed webhook, then preserves original target', async()=>{
  const gate = runGateway();
  assert.equal(await gate.run(),true);
  assert.equal(gate.sent.length,1);
  assert.match(gate.sent[0].text,/AJ-20261012-R0011/);
  assert.deepEqual(gate.redirects,[gate.original]);
});

test('later click redirects immediately without a duplicate message', async()=>{
  const gate = runGateway({ready:[true]});
  assert.equal(await gate.run(),true);
  assert.equal(gate.sent.length,0);
  assert.deepEqual(gate.redirects,[gate.original]);
});

test('a concurrent click waits for the first customer message without sending another', async()=>{
  const gate = runGateway({ready:[false,true],sendAllowed:false});
  await gate.run();
  assert.equal(gate.sent.length,0);
  assert.deepEqual(gate.redirects,[gate.original]);
});

test('LIFF state retains encoded ampersands inside the original action URL', async()=>{
  const inner = new URLSearchParams({chatGate:'1',rentalCode:'AJ-20261012-R0011',lang:'en',next:'https://ajgamerental.com/c/my?go=schedule&lang=en'});
  const gate = runGateway({ready:[true],search:`?liff.state=${encodeURIComponent(`/?${inner}`)}`});
  assert.equal(gate.sandbox.params().get('next'),gate.original);
  await gate.run();
  assert.deepEqual(gate.redirects,[gate.original]);
});

test('outside a one-to-one LINE chat shows a manual fallback without auto-sending', async()=>{
  const gate = runGateway({context:'external'});
  await gate.run();
  assert.equal(gate.sent.length,0);
  assert.equal(gate.actions.items.length,2);
  assert.match(gate.actions.items[0].href,/oaMessage/);
});
