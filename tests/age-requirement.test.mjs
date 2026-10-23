import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the step guide adds the age rule right after the first-time verification rule, TH/EN', () => {
  assert.match(source, /<span class="step-mark">ผู้เช่าครั้งแรกต้องยืนยันตัวตนก่อนนัดส่งเครื่อง<\/span> <span class="step-mark">ผู้เช่าต้องมีอายุ 20 ปีบริบูรณ์ขึ้นไป<\/span>/);
  assert.match(source, /<span class="step-mark">First-time renters must verify their identity before delivery\.<\/span> <span class="step-mark">Renters must be at least 20 years old\.<\/span>/);
});

test('every identity-verification view on the site shows the age rule', () => {
  assert.match(source, /function ageRequirementHtml\(\)\{\n\s+return `<p class="age-requirement">\$\{state\.lang === "en" \? "Renters must be at least 20 years old\." : "ผู้เช่าต้องมีอายุ 20 ปีบริบูรณ์ขึ้นไป"\}<\/p>`;/);
  assert.match(source, /<div class="verify-now">\n\s+\$\{ageRequirementHtml\(\)\}/, 'verify-now pop-up');
  assert.match(source, /<h3>\$\{en \? "Identity verification" : "ยืนยันตัวตน"\}<\/h3>\n\s+\$\{ageRequirementHtml\(\)\}\n\s+\$\{demoIdentityArtHtml\(\)\}/, 'booking step 3');
});
