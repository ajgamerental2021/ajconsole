const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const catalog = require('../game-catalog-core.js');

const games = [
  {id:'g1', platformId:'ps5', platformIds:['ps5','ps4'], name:'Shared Game'},
  {id:'g1', platformId:'switch2', name:'Different Game'},
  {id:'g2', platformId:'ps5', name:'PS5 Only'},
];

test('catalog IDs namespace legacy IDs by platform', () => {
  assert.equal(catalog.catalogId(games[0]), 'ps5::g1');
  assert.equal(catalog.catalogId(games[1]), 'switch2::g1');
});

test('selection refs support namespaced and legacy IDs within the selected console', () => {
  assert.deepEqual(catalog.resolveSelectionRefs(['ps5::g1','g2'], games, 'ps5').map(g => g.name), ['Shared Game','PS5 Only']);
  assert.deepEqual(catalog.resolveSelectionRefs(['g1'], games, 'switch2').map(g => g.name), ['Different Game']);
});

test('incoming picker data rejects games for another console and duplicates', () => {
  const input = [
    {id:'g1', catalogId:'ps5::g1', name:'Shared Game', platformId:'ps5'},
    {id:'g1', catalogId:'ps5::g1', name:'Shared Game', platformId:'ps5'},
    {id:'g9', catalogId:'switch2::g9', name:'Wrong console', platformId:'switch2'},
  ];
  assert.deepEqual(catalog.normalizeIncomingSelection(input, 'ps5', 10).map(g => g.name), ['Shared Game']);
});

test('new admin IDs are readable and collision-safe', () => {
  assert.equal(catalog.nextGameId({platformId:'ps5', name:'EA Sport FC 26'}, []), 'ps5-ea-sport-fc-26');
  assert.equal(catalog.nextGameId({platformId:'ps5', name:'EA Sport FC 26'}, [{id:'ps5-ea-sport-fc-26'}]), 'ps5-ea-sport-fc-26-2');
});

test('catalog audit catches a namespaced duplicate and unknown platform', () => {
  const errors = catalog.audit(games, ['ps5','ps4','switch2']);
  assert.equal(errors.some(error => error.code === 'duplicate_catalog_id'), false);
  assert.equal(catalog.audit([{id:'a',platformId:'bad',name:'X'}], ['ps5']).some(error => error.code === 'unknown_platform'), true);
});

test('the shipped catalogue has valid unique IDs and supported platforms', () => {
  const html = fs.readFileSync(require.resolve('../game_index.html'), 'utf8');
  const match = html.match(/const DEFAULT_GAMES = \[(.*?)\n\];/s);
  assert.ok(match, 'DEFAULT_GAMES must remain readable');
  const shippedGames = vm.runInNewContext(`[${match[1]}]`);
  const supported = ['ps5','ps4','switch2','switch1','xbox','meta','rog','p_1774941944007'];
  assert.equal(shippedGames.length, 587);
  assert.deepEqual(catalog.audit(shippedGames, supported), []);
});
