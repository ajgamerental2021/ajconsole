(function(root, factory){
  const api = factory();
  if(typeof module === "object" && module.exports) module.exports = api;
  if(root) root.AJGameCatalog = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  function clean(value){ return String(value == null ? "" : value).trim(); }
  function platformIds(game){
    const values = Array.isArray(game && game.platformIds) && game.platformIds.length
      ? game.platformIds
      : [game && game.platformId];
    return Array.from(new Set(values.map(clean).filter(Boolean).map(id => id === "ps45" ? "ps5" : id)));
  }
  function primaryPlatformId(game){
    const ids = platformIds(game);
    return ids.includes("ps5") ? "ps5" : (ids[0] || "unknown");
  }
  function catalogId(game){
    const stored = clean(game && game.catalogId);
    if(stored && stored.includes("::")) return stored;
    const id = clean(game && game.id);
    return id ? `${primaryPlatformId(game)}::${id}` : "";
  }
  function matchesPlatform(game, expectedPlatform){
    const expected = clean(expectedPlatform) === "ps45" ? "ps5" : clean(expectedPlatform);
    if(!expected) return true;
    const ids = platformIds(game);
    return ids.includes(expected) || (expected === "ps4" && ids.includes("ps5") && ids.includes("ps4"));
  }
  function resolveSelectionRefs(refs, games, expectedPlatform){
    const rows = Array.isArray(games) ? games : [];
    const used = new Set();
    return (Array.isArray(refs) ? refs : []).map(clean).map(ref => {
      const game = rows.find(row => catalogId(row) === ref)
        || rows.find(row => clean(row && row.id) === ref && matchesPlatform(row, expectedPlatform));
      if(!game || !matchesPlatform(game, expectedPlatform)) return null;
      const key = catalogId(game);
      if(!key || used.has(key)) return null;
      used.add(key);
      return game;
    }).filter(Boolean);
  }
  function normalizeIncomingSelection(items, expectedPlatform, limit){
    const max = Number.isFinite(Number(limit)) ? Number(limit) : 10;
    const used = new Set();
    return (Array.isArray(items) ? items : []).map(item => {
      const game = item && typeof item === "object" ? item : {};
      const id = clean(game.id);
      const name = clean(game.name || game.title);
      const platformId = clean(game.platformId) === "ps45" ? "ps5" : clean(game.platformId);
      const normalized = { id, catalogId: clean(game.catalogId) || (id && platformId ? `${platformId}::${id}` : ""), name, platformId, platformName:clean(game.platformName) };
      if(!id || !name || !platformId || (expectedPlatform && platformId !== expectedPlatform)) return null;
      if(used.has(normalized.catalogId)) return null;
      used.add(normalized.catalogId);
      return normalized;
    }).filter(Boolean).slice(0, max);
  }
  function slug(value){
    return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "game";
  }
  function nextGameId(game, games){
    const prefix = `${primaryPlatformId(game)}-${slug(game && game.name)}`;
    const ids = new Set((Array.isArray(games) ? games : []).map(row => clean(row && row.id)));
    if(!ids.has(prefix)) return prefix;
    let number = 2;
    while(ids.has(`${prefix}-${number}`)) number += 1;
    return `${prefix}-${number}`;
  }
  function audit(games, validPlatforms){
    const seen = new Set();
    const valid = new Set(Array.isArray(validPlatforms) ? validPlatforms.map(clean) : []);
    const errors = [];
    (Array.isArray(games) ? games : []).forEach((game, index) => {
      const id = clean(game && game.id);
      const key = catalogId(game);
      if(!id) errors.push({index, code:"missing_id"});
      if(!clean(game && game.name)) errors.push({index, code:"missing_name", id});
      if(key && seen.has(key)) errors.push({index, code:"duplicate_catalog_id", id:key});
      if(key) seen.add(key);
      platformIds(game).forEach(platform => { if(valid.size && !valid.has(platform)) errors.push({index, code:"unknown_platform", id, platform}); });
    });
    return errors;
  }
  return { platformIds, primaryPlatformId, catalogId, matchesPlatform, resolveSelectionRefs, normalizeIncomingSelection, nextGameId, audit };
});
