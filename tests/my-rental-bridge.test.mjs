import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const page = fs.readFileSync(new URL('../my-rental/index.html', import.meta.url), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'the website bridge has a script');

function open(search) {
  const fields = Object.fromEntries(['heading', 'message', 'continue'].map(id => [id, { textContent: '', href: '' }]));
  const replaced = [];
  const document = {
    documentElement: { lang: '' },
    title: '',
    getElementById: id => fields[id],
  };
  vm.runInNewContext(script, {
    URLSearchParams, encodeURIComponent, document,
    location: { search, replace: url => replaced.push(url) },
  });
  return { fields, replaced, document };
}

test('Thai and English copied links open the same signed rental on the customer page', () => {
  for (const lang of ['th', 'en']) {
    const result = open('?t=signed.token&lang=' + lang);
    assert.deepEqual(result.replaced, [
      'https://delivery-app-backend-68pm.onrender.com/c/my/r/signed.token?lang=' + lang,
    ]);
    assert.equal(result.document.documentElement.lang, lang);
    assert.equal(result.fields.continue.href, result.replaced[0]);
  }
});

test('missing or malformed tokens cannot redirect to customer data', () => {
  for (const search of ['', '?t=bad%2Ftoken&lang=en']) {
    const result = open(search);
    assert.equal(result.replaced.length, 0);
    assert.equal(result.fields.continue.href.startsWith('https://ajgamerental.com/'), true);
  }
});
