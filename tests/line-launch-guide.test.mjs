import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.indexOf(`  function ${name}(`);
  const end = source.indexOf('\n  }', start) + 4;
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
}
function harness(lang) {
  const storage = new Map();
  const context = vm.createContext({
    state: {lang, calc:{rentalCode:'AJ-TEST',maps:'map',masterAgreementAcceptedAt:'',rentalTermsAcceptedAt:''}},
    URL, Date, JSON, rentalSignature: () => 'rental',
    sessionStorage: {getItem: key => storage.get(key) || null},
    esc: value => String(value ?? ''),
    showModal: (title, body) => { context.modal = {title, body}; },
    activeShareStatus: () => context.status,
    shareChannelLabel: channel => channel,
  });
  vm.runInContext(source.slice(source.indexOf('  const I18N ='), source.indexOf('  const $ =')), context);
  vm.runInContext('function tr(key){ return I18N[state.lang][key]; }', context);
  for (const name of ['lineBookingLaunchSignature','savedLineBookingLaunch','showLineBookingHelp','shareStatusHtml']) vm.runInContext(fn(name), context);
  const saved = {url:'https://liff.line.me/test?ctx=opaque',code:'AJ-TEST',createdAt:Date.now(),signature:vm.runInContext('lineBookingLaunchSignature()', context)};
  storage.set('aj_line_booking_launch_v1', JSON.stringify(saved));
  return {context, storage, saved};
}
for (const lang of ['th','en']) {
  test(`LINE help and statuses use ${lang}, with a real same-booking link`, () => {
    const {context} = harness(lang);
    vm.runInContext('showLineBookingHelp()', context);
    assert.match(context.modal.body, /href="https:\/\/liff.line.me\/test\?ctx=opaque"/);
    assert.match(context.modal.body, lang === 'th' ? /Open this page/ : /Tap <b>Open<\/b> when prompted/);
    assert.match(context.modal.title, lang === 'th' ? /วิธีส่งข้อมูล/ : /Send booking via LINE/);
    for (const phase of ['preparing','ready','opened']) {
      context.status = {channel:'line',phase};
      const html = vm.runInContext('shareStatusHtml()', context);
      assert.match(html, /data-line-booking-help/);
      assert.doesNotMatch(html, /Please send the message in the chat|กรุณากดส่งข้อความในแชท/);
    }
  });
}
test('stale, different-rental and changed-detail launch links are not reused', () => {
  const {context, storage, saved} = harness('th');
  for (const patch of [{code:'AJ-OTHER'}, {signature:'changed'}, {createdAt:0}, {url:'https://evil.example/?ctx=opaque'}]) {
    storage.set('aj_line_booking_launch_v1', JSON.stringify({...saved,...patch}));
    assert.equal(vm.runInContext('savedLineBookingLaunch()', context), null);
  }
});
test('LINE success requires server acknowledgement and initialization has bounded waits', () => {
  assert.match(source, /!result\?\.linked \|\| !result\?\.flexSent/);
  assert.match(source, /bookingWait\(liff\.init/);
  assert.match(source, /bookingWait\(liff\.getProfile\(\)\)/);
  assert.match(source, /if\(isInsideLineClient\(\)\)\{[\s\S]*?location\.href = liffUrl\.toString\(\)/);
});
