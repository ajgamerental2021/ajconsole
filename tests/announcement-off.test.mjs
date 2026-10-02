import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('a switched-off notice never comes back when the Bot is slow or unreachable', () => {
  assert.match(html, /const DEFAULT_ANNOUNCEMENT = \{\n    enabled: false,/);
  const load = html.slice(html.indexOf('async function loadSiteAnnouncement()'), html.indexOf('function announcementColumnHtml('));
  assert.match(load, /return siteAnnouncement;/);
  assert.match(load, /return null;\n  \}$/m);
  assert.doesNotMatch(load, /return announcementContent\(\);/);
  assert.match(html, /function applySiteAnnouncement\(content\)\{\n    if\(!content\)\{ closeSiteAnnouncement\(\{dismissed:false\}\); return; \}/);
});
