const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const manifest = require('../lib/strategy-manifest.json');
const loaded = new Map();
function load(name) {
  if (loaded.has(name)) return loaded.get(name);
  const code = ts.transpileModule(fs.readFileSync(`lib/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(path =>
    path.endsWith('.json') ? manifest : load(path.replace('./', '')), module, module.exports);
  loaded.set(name, module.exports);
  return module.exports;
}
const rules = load('staking');
const { validatePublishedModelRow } = load('model-row');
for (const [label, key] of [['Win','win'],['Top 5','top_5'],['Top 10','top_10'],['Top 20','top_20'],['Make Cut','make_cut'],['Miss Cut','miss_cut'],['Matchup 2-Ball','matchup_2ball']]) {
  const spec = manifest.markets[key];
  assert.equal(rules.marketCriteria(label).minEv, spec.min_ev);
  assert.equal(rules.qualifiesMarketBet(label, spec.min_ev - .001, spec.odds_cap), false);
  assert.equal(rules.qualifiesMarketBet(label, spec.min_ev + .001, spec.odds_cap), true);
  if (!spec.exception_min_ev) assert.equal(rules.qualifiesMarketBet(label, 10, spec.odds_cap + .1), false);
  assert.equal(rules.qualifiesMarketBet(label, 10, null), false);
}
assert.equal(rules.qualifiesMarketBet('Top 5', .363769, 5.5), false);
assert.equal(rules.qualifiesMarketBet('Top 20', .36, 15), true);
assert.equal(rules.qualifiesMarketBet('Top 20', .34, 15), false);
assert.equal(rules.qualifiesMarketBet('Matchup 2-Ball', .2, 1.59), false);
assert.equal(rules.qualifiesMarketBet('Matchup 3-Ball', .9, 2), false);
const row = { dg_id: '123', player_name: 'Player', opponents: '', p_model: '.25', strategy_qualified: 'True', strategy_manifest_id: manifest.releaseId };
const pick = { dgId: '123', playerName: 'Player', pModel: .25 };
assert.equal(validatePublishedModelRow([row], pick), null);
for (const patch of [{ strategy_qualified: 'False' }, { strategy_manifest_id: 'old' }, { opponents: 'Different player' }, { p_model: '' }]) {
  assert.ok(validatePublishedModelRow([{ ...row, ...patch }], pick));
}
assert.ok(validatePublishedModelRow([row], { ...pick, pModel: .35 }));
assert.ok(validatePublishedModelRow([row], { ...pick, pModel: NaN }));
assert.ok(validatePublishedModelRow([], pick));
console.log('All market price rules and published-row eligibility checks passed');
