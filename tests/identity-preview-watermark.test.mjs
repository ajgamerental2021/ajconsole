import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('both booking identity thumbnails and expanded photos show the bilingual rental watermark', () => {
  assert.match(html, /function demoIdentityWatermarkHtml\(url, large = false\)/);
  assert.match(html, /ใช้สำหรับเช่าเครื่องเล่นเกม \$\{device\}/);
  assert.match(html, /จำนวน \$\{days\} วัน กับทาง AJ เช่าเครื่องเกมเท่านั้น/);
  assert.match(html, /For renting game console \$\{device\} only/);
  assert.match(html, /\$\{days\} days with AJ Game Rental only/);
  assert.match(html, /showModal\(tr\("identityUploadedPreview"\), demoIdentityWatermarkHtml\(url, true\)\)/);
  assert.match(html, /demoIdentityWatermarkHtml\(documentPreview\)/);
  assert.match(html, /demoIdentityWatermarkHtml\(selfiePreview\)/);
});
