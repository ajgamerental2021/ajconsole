import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n  }', start) + 4);
}
function sandbox() {
  const store = new Map();
  const ctx = vm.createContext({
    state: {adminToken: ''},
    localStorage: {getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k)},
    Date,
  });
  vm.runInContext(`const ADMIN_SESSION_KEY = "aj_admin_session_v1";${fn('rememberedAdminToken')}${fn('keepAdminSession')}${fn('forgetAdminSession')}
    this.remembered = rememberedAdminToken; this.keep = keepAdminSession; this.forget = forgetAdminSession;`, ctx);
  return {ctx, store};
}

test('a ticked sign-in keeps the Bot\'s 30-day token on this device; unticked keeps nothing', () => {
  const {ctx, store} = sandbox();
  ctx.keep({token: 'remember.abc.sig', remembered: true, expiresAt: Date.now() + 86400000}, true);
  assert.equal(ctx.state.adminToken, 'remember.abc.sig');
  assert.equal(ctx.remembered(), 'remember.abc.sig', 'the next visit is signed in');
  ctx.keep({token: 'a'.repeat(64), remembered: false, expiresAt: Date.now() + 1000}, false);
  assert.equal(store.size, 0, 'unticked: nothing stored');
  assert.equal(ctx.remembered(), '');
});

test('an expired or foreign token is not used, and sign-out forgets the device', () => {
  const {ctx, store} = sandbox();
  store.set('aj_admin_session_v1', JSON.stringify({token: 'remember.x.y', expiresAt: Date.now() - 1}));
  assert.equal(ctx.remembered(), '');
  assert.equal(store.size, 0, 'expired entry removed');
  store.set('aj_admin_session_v1', JSON.stringify({token: 'session-only', expiresAt: Date.now() + 86400000}));
  assert.equal(ctx.remembered(), '', 'only signed remember tokens are kept');
  ctx.keep({token: 'remember.abc.sig', remembered: true, expiresAt: Date.now() + 86400000}, true);
  ctx.forget();
  assert.equal(ctx.state.adminToken, '');
  assert.equal(store.size, 0);
});

test('the sign-in asks to remember (ticked by default) and sends it to the Bot, Passkey too', () => {
  assert.match(source, /<input type="checkbox" id="adminRememberInput" checked>/);
  assert.match(source, /body:JSON\.stringify\(\{username:user,password:pass,remember:byId\("adminRememberInput"\)\.checked\}\)/);
  const passkey = source.slice(source.indexOf('async function submitAdminPasskey('), source.indexOf('async function registerAdminPasskey('));
  assert.match(passkey, /keepAdminSession\(result, byId\("adminRememberInput"\)\.checked\)/);
  assert.match(source, /adminRemember:"จดจำการเข้าสู่ระบบบนเครื่องนี้ 30 วัน"/);
  assert.match(source, /adminRemember:"Keep me signed in on this device for 30 days"/);
  assert.match(source, /adminSignOut:"ออกจากระบบ"/);
  assert.match(source, /adminSignOut:"Sign out"/);
});

test('Admin opens straight away when signed in; every refused token is forgotten', () => {
  assert.match(fn('openAdmin'), /if\(!force && !state\.adminToken\)\{ openAdminLogin\(\); return; \}/);
  const resets = source.match(/forgetAdminSession\(\);/g) || [];
  assert.ok(resets.length >= 14, 'every 401 path and sign-out forget the stored session');
  assert.equal((source.match(/[^.]state\.adminToken = "";/g) || []).length, 1, 'only forgetAdminSession clears the token');
});

test('?admin=open, #admin and /admin/ open the Admin window; ?admin=1 still only shows the button', () => {
  assert.match(source, /const adminRequested = adminParam === "open" \|\| location\.hash === "#admin";/);
  assert.match(source, /if\(adminParam === "1" \|\| adminRequested \|\| state\.adminToken\) byId\("adminBtn"\)\.hidden = false;/);
  assert.match(source, /if\(adminRequested\) setTimeout\(\(\) => openAdmin\(false\), 150\);/);
  const page = readFileSync(new URL('../admin/index.html', import.meta.url), 'utf8');
  assert.match(page, /location\.replace\('\/\?admin=open'\)/);
  assert.match(page, /noindex,nofollow/);
});
