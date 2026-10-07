import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const page = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const functions = page.slice(page.indexOf('  function lineBookingSelection(){'), page.indexOf('  function launchLineConnection('));

for (const lang of ['th', 'en']) {
  test(`LINE return restores the console and dates in a fresh ${lang} browser`, () => {
    const original = {calc:{consoleId:'switch-1',type:'console',start:'2026-11-25',end:'2026-11-28',datesTouched:true}};
    const context = {
      state:original, URL, CONFIG:{lineLiffId:'test-liff'},
      location:{href:'https://ajgamerental.com/'}, history:{replaceState(_a,_b,url){ context.cleanedUrl=url; }},
      parseDate:value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null,
      diffDays:(start,end) => (new Date(end)-new Date(start))/86400000,
      consoleById:id => id === 'switch-1' ? {type:'console'} : null,
      saveLocal(){context.saved=true;},
    };
    vm.runInNewContext(`${functions}\nthis.api={lineBookingSelection,lineConnectionAppUrl,restoreLineBookingSelection};`, context);
    const selection = context.api.lineBookingSelection();
    const launch = new URL(context.api.lineConnectionAppUrl(lang,'browser','a'.repeat(32),selection));
    assert.equal(launch.searchParams.get('lineSelection'),selection);
    assert.equal(launch.searchParams.get('lang'),lang);
    context.state={calc:{consoleId:'',type:'',start:'',end:'',datesTouched:false,step:1}};
    const returned = new URL(`https://ajgamerental.com/?booking=1&lineReturn=1&lang=${lang}`);
    returned.searchParams.set('lineSelection',launch.searchParams.get('lineSelection'));
    context.location.href=returned.href;
    assert.equal(context.api.restoreLineBookingSelection(),true);
    assert.equal(context.state.calc.consoleId,'switch-1');
    assert.equal(context.state.calc.start,'2026-11-25');
    assert.equal(context.state.calc.end,'2026-11-28');
    assert.equal(context.state.calc.step,2);
    assert.equal(context.saved,true);
    assert.doesNotMatch(context.cleanedUrl,/lineSelection|lineReturn/);
  });
}

test('LIFF state keeps the booking selection through its redirect', () => {
  const handoff = page.slice(page.indexOf('  function lineBookingHandoffParams(){'), page.indexOf('  function lineBookingAppLinks('));
  const selection = JSON.stringify({c:'switch-1',t:'console',s:'2026-11-25',e:'2026-11-28'});
  const inner = new URLSearchParams({lineConnect:'1',id:'a'.repeat(32),lineSelection:selection});
  const context={location:{search:`?liff.state=${encodeURIComponent(`/?${inner}`)}`},URLSearchParams,decodeURIComponent,console};
  vm.runInNewContext(`${handoff}\nthis.read=lineBookingHandoffParams;`,context);
  assert.equal(context.read().get('lineSelection'),selection);
  assert.match(page,/returnUrl\.searchParams\.set\("lineSelection", selection\)/);
});
