import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { states, summarizeState } from '../src/data/states.ts';
import { stateSources } from './state-sources.mjs';
import { electionRules } from './election-rules.mjs';
import { parsePopulationRows } from './population.mjs';
import { validateElection } from './validate-election.mjs';
import { septemberResults } from './september-2026.mjs';

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
  votingAge: 16, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 4,
});
assert.equal(electionRules('saarland/2022').resultColumn, 1);
assert.equal(electionRules('sachsen-anhalt/2021').resultColumn, 3);

// Baselines from the PDF imports, independently matched against the official XLSX
// exports. Lock every non-provenance field, including each party's name and votes.
for (const [route, expectedHash] of Object.entries({
  "brandenburg/2024": "8804d6d8e3e9261d2223388055ab1be128f9dab870bd002f906339b1ad7b9d59"
})) {
  const { sources, ...data } = JSON.parse(readFileSync(`public/data/${route}.json`, 'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'), expectedHash, `${route}: source migration preserves election data`);
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
  'sachsen-anhalt/2026': [1706851, 1328211, 1315315],
  'schleswig-holstein/2022': [2314417, 1396747, 1387398],
  'thueringen/2024': [1655670, 1218089, 1207883],
};
assert.equal(Object.keys(states).length, 16);
for (const [slug, state] of Object.entries(states)) {
  assert.ok(state.years.includes(Number(state.latestElection.slice(0, 4))), `${slug}: latest election has data`);
  for (const year of state.years) {
    const data = JSON.parse(readFileSync(`public/data/${slug}/${year}.json`, 'utf8'));
    validateElection(data);
    const metadata = state.elections[year];
    const rules = electionRules(`${slug}/${year}`);
    assert.equal(data.votingAge, rules.votingAge);
    assert.equal(data.secondVotes.label, `Gültige ${rules.voteLabel}`);
    assert.equal(data.secondVotes.votesPerVoter, rules.votesPerVoter);
    assert.ok(rules.sources.length > 0, `${slug}/${year}: official rule references required`);
    for (const source of rules.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.ok(source.publisher && source.location);
    }
    assert.equal(data.electionDate, metadata.electionDate);
    assert.equal(data.sources.find((source) => source.id === 'results').url, metadata.url);
    const source = stateSources[`${slug}/${year}`]?.results;
    if (source) {
      assert.equal(data.unitNote, rules.unitNote);
      assert.equal(source.electionDate, metadata.electionDate);
      assert.equal(source.url, metadata.url);
    }
    if (year === Number(state.latestElection.slice(0, 4))) assert.equal(data.electionDate, state.latestElection);
    const resultCounts = expected[`${slug}/${year}`];
    if (resultCounts) assert.deepEqual([data.eligibility.eligible, data.turnout.voters, data.secondVotes.valid], resultCounts, `${slug}/${year}`);
    const demographics = data.population.demographics;
    const knownSplit = demographics.underVotingAge + demographics.nonGermanVotingAgeOrOlder;
    assert.deepEqual(data.eligibility.estimatedBreakdown, {
      underVotingAge: demographics.underVotingAge,
      nonGermanVotingAgeOrOlder: demographics.nonGermanVotingAgeOrOlder,
      otherOrTimingDifference: Math.max(0, data.eligibility.notEligible - knownSplit),
    }, `${slug}: breakdown`);
    // Independently break each conservation boundary: validation must reject it.
    for (const corrupt of [
      (d) => { d.turnout.voters = NaN; },
      (d) => { d.eligibility.eligible = d.population.residents + 1; },
      (d) => { d.secondVotes.parties[0].votes += 1; },
      (d) => { d.secondVotes.parties[0].votes = -1; },
      (d) => { d.sources = []; },
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
      (d) => { if (d.eligibility.estimatedBreakdown) d.eligibility.estimatedBreakdown.underVotingAge += 1; else d.eligibility.estimatedBreakdown = { underVotingAge: 1, nonGermanVotingAgeOrOlder: 0, otherOrTimingDifference: 0 }; },
    ]) {
      const broken = structuredClone(data);
      corrupt(broken);
      assert.throws(() => validateElection(broken), `${slug}: invalid data rejected`);
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
  const parsed = septemberResults(route, text, description);
  assert.equal(parsed.invalid, invalid);
  assert.deepEqual(parsed.parties.map((party) => party.votes), partyVotes);
  const data = JSON.parse(readFileSync(`public/data/${route}.json`, 'utf8'));
  assert.equal(data.resultStatus, 'preliminary');
  assert.equal(data.votingAge, 16);
  const row = text.split(/\r?\n/).find((line) => berlin ? line.startsWith('GI9900;') : line.includes(';A;99;') && line.includes(';2;8928;'));
  assert.throws(() => septemberResults(route, text.replace(`${row}\r\n`, ''), description), /Unique statewide/);
  assert.throws(() => septemberResults(route, `${text.trim()}\n${row}`, description), /Unique statewide/);
  const partial = row.replace(berlin ? ';4114;4114;' : ';1974;1974;', berlin ? ';4114;4113;' : ';1974;1973;');
  assert.throws(() => septemberResults(route, text.replace(row, partial), description), /Complete count/);
  const badCount = row.replace(berlin ? ';1824514;' : ';1015323;', ';oops;');
  assert.throws(() => septemberResults(route, text.replace(row, badCount), description), /Invalid/);
}
console.log('Validated 19 elections across all 16 states, demographic parsing, and rejection of corrupt data.');
