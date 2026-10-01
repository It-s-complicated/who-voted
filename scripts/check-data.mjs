import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { states, summarizeState } from '../src/data/states.ts';
import { stateSources } from './state-sources.mjs';
import { electionRules } from './election-rules.mjs';
import { parsePopulationRows } from './population.mjs';
import { electionSchema } from '../src/data/election.ts';
import { csvRows, parseCsvResults } from './csv-results.mjs';

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
// with official CSV exports. Preserve every non-provenance field; Saarland's
// ÖPD/Die Humanistien typos are intentionally corrected before hashing.
for (const [route, expectedHash] of Object.entries({
  'baden-wuerttemberg/2026': '692eb0676d6f1b78f77c73be2d94e116b60c9024b94d9496e84a20e5ab36307a',
  'bayern/2023': '8fd145e666c000f09fdef67c7382fb88d915db37e9e0019c124094e8c82b1574',
  'hessen/2023': '167e35701173df770658f21a81752bfab1876426ad6e0906aec30153448d0133',
  'mecklenburg-vorpommern/2021': '7b3763f4cad4afaae2ff885e91b1a3789a9e2f45244da9a8fa2e20abb464de18',
  'niedersachsen/2022': '943b0900459c5876c5fa01a173ffc5862b2bdf1c766063d13893af279752bb86',
  'nordrhein-westfalen/2022': '89275d16df552f5d62f4983e8c5b0826cb3baad7448010fee532e016b0847969',
  'rheinland-pfalz/2026': 'caaf5ae7d105e4b5c20c4108ec26c99c812ff1485bf619faadafb6822f3a52d1',
  'saarland/2022': 'bb13f19e6bec2b4e92f397ad3f5ab7a65ce5877ef64bd9e90afbc06a3d418453',
  'sachsen-anhalt/2021': 'aed51eae834976d961e870880c9905e39d1c730ae1f15cf9eb9cbbe053b62578',
  'sachsen-anhalt/2026': '08084f48b7cbc2d8b55cf11fb0da86024acf51aa08a34047cc94de2cc2ea2bb9',
  'schleswig-holstein/2022': 'f3fafa999413193f962250004fcba670f79558485428e254300c7229d3c487dd',
  'hamburg/2025': 'd8efb0ef7d09d0b03637683ae7a39260ecc7f728658c12560a1a7e5a6f7f1173',
  "brandenburg/2024": "d5ecc140103be1db952ca0c5815892dfa6d0e4904b952e88636c80c8e0964d56"
})) {
  const { sources: _sources, state: _state, previousParliament: _previousParliament, ...data } = JSON.parse(readFileSync(`public/data/${route}.json`, 'utf8'));
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
    const demographics = data.population.demographics;
    const knownSplit = demographics.underVotingAge + demographics.nonGermanVotingAgeOrOlder;
    assert.deepEqual(data.eligibility.estimatedBreakdown, {
      underVotingAge: demographics.underVotingAge,
      nonGermanVotingAgeOrOlder: demographics.nonGermanVotingAgeOrOlder,
      otherOrTimingDifference: Math.max(0, data.eligibility.notEligible - knownSplit),
    }, `${slug}: breakdown`);
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
      (d) => { if (d.eligibility.estimatedBreakdown) d.eligibility.estimatedBreakdown.underVotingAge += 1; else d.eligibility.estimatedBreakdown = { underVotingAge: 1, nonGermanVotingAgeOrOlder: 0, otherOrTimingDifference: 0 }; },
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
assert.deepEqual(csvRows('\uFEFFa;b\r\n"two\r\nlines";"escaped ""quote"""'), [['a', 'b'], ['two\r\nlines', 'escaped "quote"']]);
assert.throws(() => csvRows('a;b\n"unterminated;1'), /Quote Not Closed/);
assert.throws(() => parseCsvResults('unknown/2026', 'a;b'), /Unsupported CSV election/);
const st2026 = readFileSync('data/raw/sachsen-anhalt/2026/results.csv', 'utf8');
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
