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

test('a refused price save names the cause in Thai and English', () => {
  const run = (lang, result) => {
    const ctx = vm.createContext({state: {lang}});
    vm.runInContext(fn('pricingSyncFailureText') + ';this.t = pricingSyncFailureText;', ctx);
    return ctx.t(result);
  };
  const missing = {ok: false, error: 'delivery_pricing_sync_failed', delivery: {ok: false, status: 400, data: {error: 'pricing_policy_missing_models', models: ['Rayban Meta']}}};
  assert.match(run('th', missing), /มีรุ่นที่ไม่อยู่ในราคานี้: Rayban Meta/);
  assert.match(run('en', missing), /do not cover: Rayban Meta/);
  assert.match(run('th', {error: 'delivery_pricing_sync_failed', delivery: {ok: false, error: 'Delivery app responded 500'}}), /Delivery App ไม่รับราคา \(Delivery app responded 500\)/);
  assert.match(run('en', {error: 'delivery_pricing_sync_failed', delivery: {ok: false, skipped: true}}), /not connected/);
  assert.equal(run('en', {error: 'pricing_policy_amount'}), 'pricing_policy_amount');
});

test('models the Delivery App Inventory has but the price list lacks are added for the owner to check', () => {
  const ctx = vm.createContext({
    state: {consoles: [{id: 20, name: 'Ray-Ban Meta Gen 3', nameEn: 'Ray-Ban Meta Gen 3', rate: 350, weekly: 1800, deposit: 4000}]},
    pricingPolicy: {version: 1, bundleNoIdentityDeposit: 15000, devices: [{id: 'ps5', name: 'PS5', dailyRate: 400, weeklyRate: 2500, securityDeposit: 2000, noIdentityDeposit: 10000}]},
    pricingDefaults: () => ({devices: []}),
    pricingKey: value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ''),
  });
  vm.runInContext(`var pricingInventoryModels = [];${fn('pricingForAdmin')}${fn('addMissingPricingModels')};this.add = addMissingPricingModels; this.list = pricingForAdmin;`, ctx);
  const added = ctx.add({delivery: {data: {modelPrices: [
    {name: 'MSI Claw 8 AI+', dailyRate: 400, weeklyRate: 2500, securityDeposit: 2000},
    {name: 'Ray-Ban Meta Gen 3', dailyRate: 350, weeklyRate: 1800, securityDeposit: 4000},
    {name: 'XREAL One', dailyRate: 300, weeklyRate: 1500, securityDeposit: 0},
  ]}}});
  assert.equal(added, 2, 'a model already listed is not added twice');
  const rows = JSON.parse(JSON.stringify(ctx.list().devices));
  assert.deepEqual(rows.map(row => row.name), ['PS5', 'Ray-Ban Meta Gen 3', 'MSI Claw 8 AI+', 'XREAL One'], 'new rows go last');
  assert.deepEqual(rows[2], {id: 'inv_msiclaw8ai', name: 'MSI Claw 8 AI+', dailyRate: 400, weeklyRate: 2500, securityDeposit: 2000, noIdentityDeposit: 10000});
  assert.equal(rows[3].securityDeposit, 2000, 'a missing Inventory deposit starts at the standard one');
});

test('typing on the price tab survives the panel being rebuilt', () => {
  const render = fn('renderAdmin');
  assert.match(render, /if\(pricingDraftDirty && byId\("adminPricing"\)\) pricingDraft = readPricingDraft\(\);\n\s+readFaqDraftIntoState\(\);\n\s+byId\("adminBody"\)\.innerHTML/);
  assert.match(render, /if\(pricingDraftDirty\) restorePricingDraft\(pricingDraft\);/);
  assert.match(source, /document\.addEventListener\("input", event => \{ if\(event\.target\?\.closest\?\.\("#adminPricing"\)\) pricingDraftDirty = true; \}\);/);
});

test('the Step 2 WhatsApp message says the booking is finished on the website', () => {
  const start = source.indexOf('  async function chooseDemoWhatsApp(');
  const body = source.slice(start, source.indexOf('\n  }', start));
  assert.match(body, /I'm finishing my booking \$\{code\} on your website\. Once it's confirmed, please send my booking updates to this WhatsApp\./);
  assert.doesNotMatch(body, /I am booking rental/);
});
