import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function functionSource(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  let depth = 0;
  for (let i = html.indexOf('{', start); i < html.length; i += 1) {
    if (html[i] === '{') depth += 1;
    if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error(`${name} has no end`);
}

test('every method that reaches Beam names itself on the checkout, Thai and English', () => {
  const label = new Function('state', `${functionSource('paymentLinkLabel')}; return paymentLinkLabel();`);
  for (const lang of ['th', 'en']) {
    for (const payment of ['cash', 'bank', 'credit', 'ewallet']) {
      const text = label({ lang, calc: { payment } });
      assert.ok(text.trim().length > 3, `${lang}/${payment} has a label`);
      if (lang === 'en') assert.ok(!/[฀-๿]/.test(text), `en/${payment} has no Thai`);
      if (lang === 'th' && (payment === 'cash' || payment === 'bank')) assert.ok(/[฀-๿]/.test(text), `th/${payment} is Thai`);
    }
  }
  assert.equal(label({ lang: 'th', calc: { payment: 'cash' } }), 'ค่าจองคิว');
  assert.equal(label({ lang: 'en', calc: { payment: 'bank' } }), 'Full payment by Thai QR scan');
});

test('Wise shows where to send the money instead of opening a zero-baht Beam link', () => {
  const pay = functionSource('launchDemoBeamPayment');
  const wise = pay.indexOf('if(state.calc.payment === "wise")');
  const beam = pay.indexOf('await ensureBeamPaymentLink(summary, code');
  assert.ok(wise > 0 && wise < beam, 'Wise is handled before any Beam link is asked for');
  assert.match(pay.slice(0, wise), /await queueConsolePendingUpsert\(\)/);
  assert.doesNotMatch(pay.slice(wise, beam), /pendingWrite|ensureBeamPaymentLink/);
  assert.match(pay.slice(wise, beam), /showModal\(state\.lang === "en" \? "Pay by Wise" : "ชำระผ่าน Wise", wiseTransferHtml\(summary, code\)\)/);

  const render = new Function('state', 'CONFIG', 'money', 'esc', `${functionSource('wiseTransferHtml')}; return wiseTransferHtml;`);
  const config = { whatsappPhone: '66816244715', lineOaMessageUrl: 'https://line.me/R/oaMessage/%40ajgame/', wiseTag: '@somchaih6', wisePayUrl: 'https://wise.com/pay/me/somchaih6' };
  const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const money = (value) => `฿${Number(value).toLocaleString()}`;
  for (const lang of ['en', 'th']) {
    const out = render({ lang }, config, money, esc)({ upfront: 6220 }, 'AJ-20261012-R0999');
    for (const part of ['฿6,220', 'AJ-20261012-R0999', '@somchaih6', 'wise.com/pay/me/somchaih6', 'data-wise-copy-tag', 'api.whatsapp.com/send/?phone=66816244715', 'line.me/R/oaMessage/%40ajgame/']) {
      assert.ok(out.includes(part), `${lang}: ${part}`);
    }
    assert.ok(out.includes(lang === 'en' ? 'attach your receipt' : 'แนบสลิป'), lang);
  }
});
