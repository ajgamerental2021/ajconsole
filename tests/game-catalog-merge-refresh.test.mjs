import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

/**
 * GTA6 (20/11/2026): the shop saw a game a customer's LINE browser did not.
 * A saved catalogue must not lose games another device added, and a picker
 * left open must reload the catalogue.
 */
const page = readFileSync(new URL('../game_index.html', import.meta.url), 'utf8');

function mergeHarness() {
  const pick = (start, end) => page.slice(page.indexOf(start), page.indexOf(end));
  const code = pick('function normalizeBundleGame(', 'function applyDataBundle(')
    + pick('function mergeRemoteCatalog(', 'function fetchLatestGistBundle(')
    + `var DEFAULT_GAMES = []; var deletedGameIds = []; var games = [];
       function isDeletedGame(id){ return deletedGameIds.includes(String(id)); }
       this.api = { setGames: v => { games = v; }, getGames: () => games, base: rememberCatalogBaseline, merge: mergeRemoteCatalog, deleted: () => deletedGameIds,
         del: id => { games = games.filter(g => g.id !== id); deletedGameIds.push(id); } };`;
  const ctx = {};
  vm.runInNewContext(code, ctx);
  return ctx.api;
}
const g = (id, extra = {}) => ({ id, name: id, platforms: ['ps5'], ...extra });

test('a device opened before GTA6 was added saves without wiping it', () => {
  const api = mergeHarness();
  api.setGames([g('gta5'), g('fifa')]);
  api.base();
  api.setGames([g('gta5', { name: 'GTA V edited' }), g('fifa')]);
  api.merge({ games: [g('gta5'), g('fifa', { unavailable: true }), g('gta6')], deletedGameIds: [] });
  const byId = Object.fromEntries(api.getGames().map(x => [x.id, x]));
  assert.equal(Object.keys(byId).sort().join(','), 'fifa,gta5,gta6');
  assert.equal(byId.gta5.name, 'GTA V edited', 'the change made here stays');
  assert.equal(byId.fifa.unavailable, true, 'a change made elsewhere is kept');
});

test('deletions on either side stay deleted; a game new on this device is kept', () => {
  const api = mergeHarness();
  api.setGames([g('a'), g('b'), g('c')]);
  api.base();
  api.del('a');
  api.setGames([...api.getGames(), g('new-here')]);
  api.merge({ games: [g('a'), g('b')], deletedGameIds: ['c'] });
  assert.equal(api.getGames().map(x => x.id).sort().join(','), 'b,new-here');
});

test('the picker reloads a catalogue that failed or has been open a while', () => {
  assert.match(page, /if \(e\.data && e\.data\.type === 'AJ_PICKER_OPEN'\) refreshCatalog\(60 \* 1000\);/);
  assert.match(page, /if \(document\.visibilityState === 'visible'\) refreshCatalog\(2 \* 60 \* 1000\);/);
  assert.match(page, /if \(!result\) retryCatalogLoad\(1\);/);
  assert.match(page, /gistPushChain = gistPushChain\.then\(/);
});
