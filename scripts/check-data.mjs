import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { states } from '../src/data/states.ts';
import { parsePopulationRows } from './population.mjs';
import { validateElection } from './validate-election.mjs';

const expected = {
  'baden-wuerttemberg': [7764858, 5406737, 5375109],
  bayern: [9430600, 6895807, 13658782],
  brandenburg: [2076920, 1513975, 1501619],
  hessen: [4332235, 2858313, 2813313],
  'mecklenburg-vorpommern': [1312471, 928807, 913863],
  niedersachsen: [6064738, 3657967, 3623886],
  'nordrhein-westfalen': [12965858, 7200293, 7146831],
  'rheinland-pfalz': [2990064, 2046542, 2028230],
  saarland: [746307, 458113, 452411],
  sachsen: [3182683, 2367607, 2347973],
  'sachsen-anhalt': [1788930, 1079045, 1063697],
  'schleswig-holstein': [2314417, 1396747, 1387398],
  thueringen: [1655670, 1218089, 1207883],
};
assert.equal(Object.keys(states).length, 16);
for (const [slug, state] of Object.entries(states)) {
  assert.ok(state.years.includes(Number(state.latestElection.slice(0, 4))), `${slug}: latest election has data`);
  for (const year of state.years) {
    const data = JSON.parse(readFileSync(`public/data/${slug}/${year}.json`, 'utf8'));
    validateElection(data);
    if (year === Number(state.latestElection.slice(0, 4))) assert.equal(data.electionDate, state.latestElection);
    const resultCounts = slug === 'sachsen-anhalt' && year === 2026 ? [1706851, 1328211, 1315315] : expected[slug];
    if (resultCounts) assert.deepEqual([data.eligibility.eligible, data.turnout.voters, data.secondVotes.valid], resultCounts, slug);
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
console.log('Validated 17 elections across all 16 states, demographic parsing, and rejection of corrupt data.');
