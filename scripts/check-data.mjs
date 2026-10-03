import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { states, summarizeState } from '../src/data/states.ts';
import { stateSources } from './state-sources.mjs';
import { electionRules } from './election-rules.mjs';
import { parsePopulationRows } from './population.mjs';
import { electionSchema } from '../src/data/election.ts';
import { parseCsvResults } from './csv-results.mjs';

// A newer election must change the summary without changing historical metadata.
const historical = structuredClone(states['sachsen-anhalt'].elections);
const extended = { name: 'Sachsen-Anhalt', elections: structuredClone(historical) };
extended.elections[2031] = {
  electionDate: '2031-09-07', url: 'https://example.org/2031/results.html',
  previousParliament: ['CDU'],
};
const summary = summarizeState(extended);
assert.equal(summary.latestElection, '2031-09-07');
assert.equal(summary.resultsUrl, extended.elections[2031].url);
assert.deepEqual(summary.years, [2021, 2026, 2031]);
for (const year of [2021, 2026]) assert.deepEqual(summary.elections[year], historical[year]);
for (const patch of [
  { electionDate: undefined }, { electionDate: '2026-02-30' },
  { electionDate: '2030-09-07' }, { url: undefined }, { url: 'not-a-url' },
  { previousParliament: [] },
]) {
  const broken = structuredClone(extended);
  Object.assign(broken.elections[2026], patch);
  assert.throws(() => summarizeState(broken), /Sachsen-Anhalt\/2026: (missing|invalid)/);
}
assert.throws(() => summarizeState({ name: 'Empty', elections: {} }), /no elections configured/);

// Unconfigured historical and future elections must never inherit state defaults.
for (const route of ['baden-wuerttemberg/2021', 'schleswig-holstein/2009', 'sachsen-anhalt/2031', 'unknown/2026', 'toString']) {
  assert.throws(() => electionRules(route), /missing election rules/);
}
const { sources: bwRuleSources, ...bwRules } = electionRules('baden-wuerttemberg/2026');
assert.deepEqual(bwRules, {
  votingAge: 16, voteLabel: 'Zweitstimmen', votesPerVoter: 1,
});
// Only retained HTML results (including supplementary evidence) need a column.
for (const [route, sources] of Object.entries(stateSources)) {
  const usesHtml = sources.results.file.endsWith('.html') || Boolean(sources['supplementary-results']);
  assert.equal(Object.hasOwn(electionRules(route), 'resultColumn'), usesHtml, `${route}: HTML column configuration`);
}

// Baselines from the previous HTML/PDF/XLSX imports, independently compared
// with official CSV exports where available, excluding the removed duplicate demographic split.
// Preserve every remaining non-provenance field; Saarland's
// ÖPD/Die Humanistien typos are intentionally corrected before hashing.
for (const [route, expectedHash] of Object.entries({
  'baden-wuerttemberg/2026': '8be97616b177b9c9fe85613932689910a8240529e74698271e5033806109dc4e',
  'bayern/2023': '8f9a4867b05d17bc812d712730b678b2116767f0d8d6c7802a5ed1b5aeb804be',
  'bremen/2023': '944a29d38e625bf326ccd5599395accf75a24089fac6704069becf983cc0b42c',
  'hessen/2023': '165c212322b65af8ccb8596b809925dd8a5330ed76cc59fbf96b7a8343b390e6',
  'mecklenburg-vorpommern/2021': 'f362f455dfa9b323e1002fcbfd5914a64c25f99fd681b7ce6e0b43b2ea7f8d10',
  'niedersachsen/2022': 'fae7e47646c8f7729c5f21a8b7569216ccdcf932b38879a15d2a74f9e6dc1d80',
  'nordrhein-westfalen/2022': '513342dae0f2728264349d6678093081d87668af815d296624963078b98cc3b1',
  'rheinland-pfalz/2026': '194a2a997a14f920fe7d18e83d9f255c72b30b92a3caec5bac876bca096299f4',
  'saarland/2022': '4d9ebf3189abcc22b0c3a10fc00314ca52d95b2197cd495209d91767a0339dab',
  'sachsen-anhalt/2021': 'e99c906e236a127a2266e18414f1d7ff85bd5a4bb0ab60ad5007d9d1275f0df5',
  'sachsen-anhalt/2026': '914114be3c986a5b364130f68f60fda8310a0525da77502422dfae9d8e91fc3f',
  'schleswig-holstein/2022': '4e53b23e01248c84b2c29e9cfea1d24a93f7808a683b332ac342d82bae85c62c',
  'hamburg/2025': 'ad68e1ff392d2b2e73b52cb3456c2d11fe4a63148c345c43321ff41be57ec346',
  "brandenburg/2024": "d38be039d498088281890541b96b5c77dc4737c8ec0e39e31fabb3c1ec8275b7"
})) {
  const { sources: _sources, state: _state, previousParliament: _previousParliament, ...data } = JSON.parse(readFileSync(`public/data/${route}.json`, 'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'), expectedHash, `${route}: processing preserves election data`);
}

// Population-basis migration must preserve every Berlin 2023 election count.
const berlin2023 = JSON.parse(readFileSync('public/data/berlin/2023.json', 'utf8'));
const { noValidLabel, ...berlinVotes } = berlin2023.secondVotes;
assert.equal(createHash('sha256').update(JSON.stringify({
  eligible: berlin2023.eligibility.eligible, turnout: berlin2023.turnout, secondVotes: berlinVotes,
})).digest('hex'), 'ee70abc37b6a9abffd39103812e4c37d49bc24d2179571ae2d894d8a5c55f0f6');
const berlin2026 = JSON.parse(readFileSync('public/data/berlin/2026.json', 'utf8'));
assert.equal(berlin2023.population.basis, berlin2026.population.basis);
assert.equal(berlin2023.population.basis, 'Bevölkerungsfortschreibung auf Basis des Zensus 2022');
assert.equal(berlin2023.population.referenceDate, '2022-12-31');
assert.equal(berlin2023.population.residents, 3632853);
assert.equal(berlin2023.population.demographics.underVotingAge, 606468);
assert.equal(berlin2023.population.demographics.nonGermanVotingAgeOrOlder, 644945);

const expected = {
  'berlin/2026': [2487318, 1846170, 1824514],
  'baden-wuerttemberg/2026': [7764858, 5406737, 5375109],
  'bayern/2023': [9430600, 6895807, 13658782],
  'brandenburg/2024': [2076920, 1513975, 1501619],
  'hessen/2023': [4332235, 2858313, 2813313],
  'mecklenburg-vorpommern/2021': [1312471, 928807, 913863],
  'mecklenburg-vorpommern/2026': [1311294, 1024251, 1015323],
  'niedersachsen/2022': [6064738, 3657967, 3623886],
  'nordrhein-westfalen/2022': [12965858, 7200293, 7146831],
  'rheinland-pfalz/2026': [2990064, 2046542, 2028230],
  'saarland/2022': [746307, 458113, 452411],
  'sachsen/2024': [3182683, 2367607, 2347973],
  'sachsen-anhalt/2021': [1788930, 1079045, 1063697],
  'sachsen-anhalt/2026': [1706852, 1327991, 1315282],
  'schleswig-holstein/2022': [2314417, 1396747, 1387398],
  'thueringen/2024': [1655670, 1218089, 1207883],
};
assert.equal(Object.keys(states).length, 16);
for (const [slug, state] of Object.entries(states)) {
  assert.ok(state.years.includes(Number(state.latestElection.slice(0, 4))), `${slug}: latest election has data`);
  for (const year of state.years) {
    const data = JSON.parse(readFileSync(`public/data/${slug}/${year}.json`, 'utf8'));
    assert.deepEqual(electionSchema.parse(data), data, `${slug}/${year}: collection preserves every data field`);
    assert.deepEqual(data.state, { slug, name: state.name });
    assert.deepEqual(data.previousParliament, state.elections[year].previousParliament);
    if (slug === 'sachsen-anhalt' && year === 2026) assert.equal(data.resultStatus, 'final');
    const metadata = state.elections[year];
    const rules = electionRules(`${slug}/${year}`);
    assert.equal(data.votingAge, rules.votingAge);
    assert.equal(data.secondVotes.label, `Gültige ${rules.voteLabel}`);
    assert.equal(data.secondVotes.votesPerVoter, rules.votesPerVoter);
    assert.equal(data.unitNote, rules.unitNote);
    assert.ok(rules.sources.length > 0, `${slug}/${year}: official rule references required`);
    for (const source of rules.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.ok(source.publisher && source.location);
    }
    assert.equal(data.electionDate, metadata.electionDate);
    assert.equal(data.sources.find((source) => source.id === 'results').url, metadata.url);
    const source = stateSources[`${slug}/${year}`]?.results;
    if (source) {
      assert.equal(source.electionDate, metadata.electionDate);
      assert.equal(source.url, metadata.url);
    }
    if (year === Number(state.latestElection.slice(0, 4))) assert.equal(data.electionDate, state.latestElection);
    const resultCounts = expected[`${slug}/${year}`];
    if (resultCounts) assert.deepEqual([data.eligibility.eligible, data.turnout.voters, data.secondVotes.valid], resultCounts, `${slug}/${year}`);
    assert.ok(!Object.hasOwn(data.eligibility, 'estimatedBreakdown'), `${slug}: no duplicate demographic counts`);
    // Independently break each conservation boundary: validation must reject it.
    for (const corrupt of [
      (d) => { delete d.state; },
      (d) => { d.state.name = ''; },
      (d) => { d.state.slug = '../berlin'; },
      (d) => { d.previousParliament = []; },
      (d) => { d.title = 123; },
      (d) => { d.turnout.voters = NaN; },
      (d) => { d.eligibility.eligible = d.population.residents + 1; },
      (d) => { d.secondVotes.parties[0].votes += 1; },
      (d) => { d.secondVotes.parties[0].votes = -1; },
      (d) => { d.secondVotes.parties.push({ name: d.secondVotes.parties[0].name, votes: 0 }); },
      (d) => { d.secondVotes.votesPerVoter = 0; },
      (d) => { d.year += 1; },
      (d) => { d.sources = []; },
      (d) => { d.sources.push(structuredClone(d.sources[0])); },
      (d) => { delete d.population.demographics; },
      (d) => { delete d.population.demographics.underVotingAge; },
      (d) => { d.population.demographics.nonGermanVotingAgeOrOlder = NaN; },
      (d) => { d.population.demographics.sourceIds = ['missing']; },
      (d) => { d.population.sourceId = 'missing'; },
      (d) => { d.population.basis = ''; },
      (d) => { d.population.referenceDate = '2023-02-30'; },
      (d) => { d.population.note = ''; },
      (d) => { d.population.demographics.method = 'estimated'; delete d.population.demographics.note; },
      (d) => { d.population.demographics.referenceDate = '2000-01-01'; delete d.population.demographics.note; },
      (d) => { if (d.ballots) d.ballots.valid += 1; else d.secondVotes.invalid += 1; },
      (d) => { d.population.demographics.underVotingAge = -1; },
      (d) => { d.population.demographics.underVotingAge = d.population.residents + 1; },
      (d) => {
        d.population.demographics.underVotingAge = d.eligibility.notEligible + 1;
        d.population.demographics.nonGermanVotingAgeOrOlder = 0;
        delete d.eligibility.note;
      },
    ]) {
      const broken = structuredClone(data);
      corrupt(broken);
      assert.throws(() => electionSchema.parse(broken), `${slug}: invalid collection data rejected`);
    }
  }
}
// Both export formats must reject missing, duplicate and malformed demographic cells.
for (const census of [false, true]) {
  const rows = [];
  const foreign = census ? 'AUSLAND' : 'NATA';
  function row(nationality, age, value) {
    const cells = Array(22).fill('');
    cells[4] = '2022-05-15'; cells[8] = 'Test';
    cells[census ? 5 : 16] = census ? 'GEOBL1' : 'Insgesamt';
    cells[census ? 15 : 11] = nationality;
    cells[census ? 11 : 19] = age;
    cells[census ? 17 : 21] = String(value);
    return cells;
  }
  rows.push(row('', '', 1000), row(foreign, '', 200));
  for (let age = 0; age < 18; age++) {
    const code = census ? (age === 0 ? 'ALTERU01' : `ALTER${String(age).padStart(3, '0')}`) : `ALT${String(age).padStart(3, '0')}`;
    rows.push(row('', code, 10), row(foreign, code, 2));
  }
  const parse = (input, age = 18) => parsePopulationRows(input, '2022-05-15', 'Test', age, census);
  assert.deepEqual(parse(rows), { residents: 1000, underVotingAge: 180, nonGermanVotingAgeOrOlder: 164 });
  assert.deepEqual(parse(rows, 16), { residents: 1000, underVotingAge: 160, nonGermanVotingAgeOrOlder: 168 });
  assert.throws(() => parse(rows.slice(0, -1)));
  assert.throws(() => parse([...rows, rows[0]]));
  const malformed = structuredClone(rows);
  malformed[2][census ? 17 : 21] = '-';
  assert.throws(() => parse(malformed));
}
// Independently matched to each official statewide HTML table on 21.09.2026.
for (const [route, invalid, partyVotes] of [
  ['berlin/2026', 21656, [342516, 220939, 260700, 468060, 296601, 46341, 38642, 13536, 37880, 1551, 2070, 2560, 521, 80, 716, 86041, 5760]],
  ['mecklenburg-vorpommern/2026', 8928, [360393, 388026, 49629, 66388, 57587, 10415, 11131, 3823, 2760, 2003, 981, 892, 49036, 4798, 818, 940, 2545, 1909, 1249]],
]) {
  const berlin = route.startsWith('berlin/');
  const text = new TextDecoder(berlin ? 'utf-8' : 'windows-1252').decode(readFileSync(`data/raw/${route}/results.csv`));
  const description = berlin ? new TextDecoder('windows-1252').decode(readFileSync(`data/raw/${route}/description.csv`)) : '';
  const parsed = parseCsvResults(route, text, description);
  assert.equal(parsed.invalid, invalid);
  assert.deepEqual(parsed.parties.map((party) => party.votes), partyVotes);
  const data = JSON.parse(readFileSync(`public/data/${route}.json`, 'utf8'));
  assert.equal(data.resultStatus, 'preliminary');
  assert.equal(data.votingAge, 16);
  const row = text.split(/\r?\n/).find((line) => berlin ? line.startsWith('GI9900;') : line.includes(';A;99;') && line.includes(';2;8928;'));
  assert.throws(() => parseCsvResults(route, text.replace(`${row}\r\n`, ''), description), /Unique statewide/);
  assert.throws(() => parseCsvResults(route, `${text.trim()}\n${row}`, description), /Unique statewide/);
  const partial = row.replace(berlin ? ';4114;4114;' : ';1974;1974;', berlin ? ';4114;4113;' : ';1974;1973;');
  assert.throws(() => parseCsvResults(route, text.replace(row, partial), description), /Complete count/);
  const badCount = row.replace(berlin ? ';1824514;' : ';1015323;', ';oops;');
  assert.throws(() => parseCsvResults(route, text.replace(row, badCount), description), /Invalid/);
}
// Quoting and multiline cells are required by the new official layouts. The
// relaxed preamble widths must not relax statewide uniqueness or count checks.
assert.throws(() => parseCsvResults('sachsen-anhalt/2026', 'a;b\n"unterminated;1'), /Quote Not Closed/);
assert.throws(() => parseCsvResults('unknown/2026', 'a;b'), /Unsupported CSV election/);
const st2026 = readFileSync('data/raw/sachsen-anhalt/2026/results.csv', 'utf8');
assert.deepEqual(
  parseCsvResults('sachsen-anhalt/2026', '\uFEFF"two\r\nlines";"escaped ""quote"""\r\n\r\n' + st2026),
  parseCsvResults('sachsen-anhalt/2026', st2026),
);
const stRow = st2026.split(/\r?\n/).find((line) => line.startsWith('"E";"06.09.2026";"LAN";"15";"Sachsen-Anhalt";"";'));
assert.ok(stRow);
assert.throws(() => parseCsvResults('sachsen-anhalt/2026', `${st2026.trim()}\n${stRow}`), /Unique statewide/);
const malformedStRow = stRow.replace(';1327991;', ';oops;');
assert.notEqual(malformedStRow, stRow);
assert.throws(() => parseCsvResults('sachsen-anhalt/2026', st2026.replace(stRow, malformedStRow)), /Invalid/);
const nds2022 = readFileSync('data/raw/niedersachsen/2022/results.csv', 'utf8');
assert.throws(() => parseCsvResults('niedersachsen/2022', nds2022.trim().split(/\r?\n/).slice(0, -1).join('\n')), /Complete count/);
assert.equal(parseCsvResults('niedersachsen/2022', nds2022).invalid, undefined, 'Missing invalid votes must come from supplementary evidence');
console.log('Validated 19 elections across all 16 states, CSV migrations, demographic parsing, and rejection of corrupt data.');
