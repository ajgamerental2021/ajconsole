import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  }', start) + 4);
}

test('Ray-Ban Meta Gen 3 is listed at ฿350 / ฿1,800 / ฿4,000 and opens on 28 Oct 2026', () => {
  assert.match(source, /\{id:20,name:"Ray-Ban Meta Gen 3",nameEn:"Ray-Ban Meta Gen 3",rate:350,weekly:1800,deposit:4000,type:"vr",brand:"meta",icon:"🕶️",showGameButton:false,gamePlatform:"",readyDate:"2026-10-28"\}/);
  assert.ok(existsSync(new URL('../assets/consoles/ray-ban-meta-gen-3.webp', import.meta.url)), 'its photo is published');
});

test('the glasses get no game list and list their kit in both languages', () => {
  const ctx = vm.createContext({});
  vm.runInContext(`${fn('guessPlatform')}${fn('defaultDetails')};this.p = guessPlatform; this.d = defaultDetails;`, ctx);
  const glasses = {name: 'Ray-Ban Meta Gen 3'};
  assert.equal(ctx.p(glasses), '');
  assert.equal(ctx.p({name: 'Meta Quest 3'}), 'meta', 'Meta Quest keeps its games');
  assert.match(ctx.d(glasses, 'th').join(' '), /Charging Case/);
  assert.match(ctx.d(glasses, 'en').join(' '), /Microfibre cleaning cloth/);
});
