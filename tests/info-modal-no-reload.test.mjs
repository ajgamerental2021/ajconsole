import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

/**
 * 22/11/2026: the Rental Terms window reloaded while being read and sent the
 * reader back to the top. Every data refresh redraws the page, and the open
 * window rebuilt its terms frame each time.
 */
const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = page.indexOf('  function renderInfoModal(){');
const fn = page.slice(start, page.indexOf('\n  }\n', start) + 4);

function setup() {
  const el = () => ({ textContent: '', innerHTML: '', dataset: {}, classList: { contains: () => true }, setAttribute() {} });
  const els = { infoModal: el(), infoModalTitle: el(), infoModalSubtitle: el(), infoModalLang: el(), infoTermsCopyUrl: el(), infoModalClose: el(), infoModalBody: el() };
  let writes = 0;
  const body = els.infoModalBody;
  let html = '';
  Object.defineProperty(body, 'innerHTML', { get: () => html, set: (v) => { html = v; writes += 1; } });
  const ctx = {
    state: { lang: 'th' }, activeInfoPage: 'terms', URL,
    CONFIG: { apiBase: 'https://bot.example.com' },
    INFO_COPY: { th: { termsTitle: 'เงื่อนไขการเช่า', termsSubtitle: 's' }, en: { termsTitle: 'Rental Terms', termsSubtitle: 's' } },
    byId: (id) => els[id], icon: () => '', esc: (v) => String(v), tr: (v) => v,
    aboutInfoHtml: () => '', contactListHtml: () => '', richTextHtml: () => '', privacyText: () => '',
  };
  vm.runInNewContext(fn + '\nthis.render = renderInfoModal;', ctx);
  return { ctx, writes: () => writes, html: () => html };
}

test('redrawing the page keeps the open terms frame (no reload, the reader stays where they are)', () => {
  const t = setup();
  t.ctx.render();
  assert.equal(t.writes(), 1);
  assert.match(t.html(), /rental-terms\/\?lang=th&amp;embed=1|rental-terms\/\?lang=th&embed=1/);
  for (let i = 0; i < 5; i += 1) t.ctx.render();
  assert.equal(t.writes(), 1, 'five data refreshes later: still the same frame');
  t.ctx.state.lang = 'en';
  t.ctx.render();
  assert.equal(t.writes(), 2, 'switching language loads the other language');
  assert.match(t.html(), /lang=en/);
});

test('closing the window forgets it, so opening it again draws it', () => {
  assert.match(page, /byId\("infoModalBody"\)\.innerHTML = "";\n    delete byId\("infoModalBody"\)\.dataset\.rendered;/);
});
