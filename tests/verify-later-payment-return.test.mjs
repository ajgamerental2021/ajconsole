import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const page = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

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

test('step 3 "Verify later" asks Yes/No first; Yes goes to the order summary, No leaves it unticked', () => {
  assert.match(html, /if\(event\.target\.id === "demoIdentitySkip"\)\{[\s\S]*?if\(event\.target\.checked\)\{\n          event\.target\.checked = false;\n          askDemoVerifyLater\(\);\n          return;/);
  const ask = functionSource('askDemoVerifyLater');
  assert.match(ask, /ต้องการยืนยันตัวตนภายหลังใช่ไหม/);
  assert.match(ask, /Do you want to verify your identity later\?/);
  assert.match(ask, /data-verify-later-no>\$\{en \? "No" : "ไม่"\}/);
  assert.match(ask, /data-verify-later-yes>\$\{en \? "Yes" : "ใช่"\}/);
  const accept = functionSource('acceptDemoVerifyLater');
  assert.match(accept, /state\.calc\.noContract = true;[\s\S]*await confirmDemoOrder\(\);/);
  assert.match(html, /if\(event\.target\.closest\("\[data-verify-later-no\]"\)\)\{ closeModal\(\); render\(\); return; \}/);
  assert.match(html, /if\(event\.target\.closest\("\[data-verify-later-yes\]"\)\)\{ closeModal\(\); await acceptDemoVerifyLater\(\); return; \}/);
});

test('coming back from the payment page without paying says so, with pay later or try again', () => {
  for (const launcher of ['launchDemoBeamPayment', 'launchPayResume']) {
    const source = functionSource(launcher);
    assert.ok(source.indexOf('rememberBeamDeparture(') > 0 && source.indexOf('rememberBeamDeparture(') < source.lastIndexOf('location.href'), launcher);
  }
  const back = functionSource('handleReturnFromPayment');
  assert.match(back, /hideDemoBusy\(\);/);
  assert.match(back, /การชำระเงินไม่สำเร็จ/);
  assert.match(back, /Payment not completed/);
  assert.match(back, /data-payment-later>\$\{en \? "Pay later" : "ชำระเงินทีหลัง"\}/);
  assert.match(back, /data-payment-retry=[\s\S]*\$\{en \? "Try paying again" : "ลองชำระเงินอีกครั้ง"\}/);
  assert.match(html, /if\(event\.persisted\) window\.setTimeout\(handleReturnFromPayment, 150\);/);
  assert.match(html, /window\.setTimeout\(handleReturnFromPayment, 600\);/);
  assert.match(html, /if\(paymentRetry\.dataset\.paymentRetry === "resume"\) await launchPayResume\(\);\n        else await launchDemoBeamPayment\(\);/);
  // Reaching the result pages means the customer did not just come back.
  for (const name of ['payment-success.html', 'payment-failed.html']) assert.match(page(name), /sessionStorage\.removeItem\("aj_beam_departure_v1"\)/, name);
});

test('"verify to lower the deposit" uses the signed upgrade API, keeps entries and says what is wrong', () => {
  const link = functionSource('identityUpgradeTokenForOrder');
  assert.match(link, /\/api\/identity-upgrade\/link/);
  assert.match(link, /rentalViewToken\(code\)/);
  const upgrade = functionSource('submitIdentityUpgrade');
  for (const key of ['identityType', 'identityNumber', 'identityExpiry', 'idCardImageDataUrl', 'selfieImageDataUrl', 'signatureDataUrl', 'consentAccepted']) assert.match(upgrade, new RegExp(`${key}:`), key);
  assert.match(upgrade, /if\(result\.error === "already_upgraded"\) return \{ok:true, already:true\};/);
  // No step-2 check (LINE connection, contact fields) can block it any more.
  assert.doesNotMatch(functionSource('verifyNowProblems'), /demoStep2Problems|lineConnectBtn/);
  // The answer is shown above the button, not only in a toast.
  assert.match(functionSource('verifyNowBodyHtml'), /id="verifyNowStatus" role="alert"/);
  const submit = functionSource('submitVerifyNow');
  assert.match(submit, /setVerifyNowStatus\(problem\.message\);/);
  assert.match(functionSource('closeModal'), /Object\.assign\(demoProfile, verifyForDepositSnapshot\.profile, kept\);/);
  for (const key of ['idDocument', 'selfieWithId', 'identityNumber', 'identityExpiry', 'agreementConsent']) assert.match(html, new RegExp(`VERIFY_NOW_KEPT_FIELDS = \\[[^\\]]*"${key}"`), key);
  // A phone's bottom bar no longer hides the toast.
  assert.match(html, /\.toast\{position:fixed;left:50%;bottom:calc\(env\(safe-area-inset-bottom, 0px\) \+ 96px\);[^}]*z-index:100001/);
});

test('"Fill number and expiry from the photo" shows its progress under its own button and allows the first download', () => {
  assert.match(html, /data-read-ocr="id" \$\{demoOcr\.busy \? "disabled" : ""\}/);
  assert.match(html, /<span class="demo-ocr-status \$\{demoOcr\.error \? "is-error" : ""\}" role="status">\$\{esc\(demoOcrStatusText\(\)\)\}<\/span>/);
  const read = functionSource('readDemoIdentity');
  assert.match(read, /reject\(new Error\("ocr_timeout"\)\), 120000\)/);
  assert.match(read, /if\(found\.number\) demoProfile\.identityNumber = found\.number;/);
  assert.match(html, /identityReadOptional:"อ่านเลขและวันหมดอายุจากรูป \(ไม่บังคับ\)"/);
  assert.match(html, /identityReadOptional:"Fill number and expiry from the photo \(optional\)"/);
  const ocr = readFileSync(new URL('../assets/identity-ocr.js', import.meta.url), 'utf8');
  assert.match(ocr, /logger: \(event\) => \{ if \(progressListener\) progressListener\(event\.progress, event\.status\); \}/);
});
