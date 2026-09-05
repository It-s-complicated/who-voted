import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { states } from '../src/data/states.ts';
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
// Estimated non-voter splits (underVotingAge, nonGermanVotingAgeOrOlder, other).
// States missing here have no verified split; they must keep the overall note.
const expectedBreakdown = {
  bayern: [2208310, 1633042, 97441],
  hessen: [1059549, 904347, 95229],
  sachsen: [653015, 246495, 7274],
  thueringen: [326406, 131081, 9178],
};
assert.equal(Object.keys(states).length, 16);
for (const [slug, state] of Object.entries(states)) {
  assert.ok(state.years.includes(Number(state.latestElection.slice(0, 4))), `${slug}: latest election has data`);
  for (const year of state.years) {
    const data = JSON.parse(readFileSync(`public/data/${slug}/${year}.json`, 'utf8'));
    validateElection(data);
    assert.equal(data.electionDate, state.latestElection);
    if (expected[slug]) assert.deepEqual([data.eligibility.eligible, data.turnout.voters, data.secondVotes.valid], expected[slug], slug);
    if (expectedBreakdown[slug]) assert.deepEqual(Object.values(data.eligibility.estimatedBreakdown ?? {}), expectedBreakdown[slug], `${slug}: breakdown`);
    // Independently break each conservation boundary: validation must reject it.
    for (const corrupt of [
      (d) => { d.turnout.voters = NaN; },
      (d) => { d.eligibility.eligible = d.population.residents + 1; },
      (d) => { d.secondVotes.parties[0].votes += 1; },
      (d) => { d.secondVotes.parties[0].votes = -1; },
      (d) => { d.sources = []; },
      (d) => { if (d.ballots) d.ballots.valid += 1; else d.secondVotes.invalid += 1; },
      (d) => { if (d.eligibility.estimatedBreakdown) d.eligibility.estimatedBreakdown.underVotingAge += 1; else d.eligibility.estimatedBreakdown = { underVotingAge: 1, nonGermanVotingAgeOrOlder: 0, otherOrTimingDifference: 0 }; },
    ]) {
      const broken = structuredClone(data);
      corrupt(broken);
      assert.throws(() => validateElection(broken), `${slug}: invalid data rejected`);
    }
  }
}
console.log('Validated results for all 16 states and rejection of corrupt counts.');
