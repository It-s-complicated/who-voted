import assert from 'node:assert/strict';

export function validateElection(data) {
  const check = (value, path) => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, `${data.id}: ${path} must be a nonnegative integer`);
  };
  const { population, eligibility, turnout, secondVotes: votes, ballots } = data;
  function date(value, label) {
    assert.ok(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value), `${data.id}: invalid ${label}`);
    const timestamp = Date.parse(value);
    assert.ok(Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value, `${data.id}: invalid ${label}`);
  }
  function text(value, label) {
    assert.ok(typeof value === 'string' && value.trim(), `${data.id}: missing ${label}`);
  }
  for (const [group, values] of Object.entries({ population, eligibility, turnout, votes, ballots })) {
    if (!values) continue;
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'number') check(value, `${group}.${key}`);
    }
  }
  for (const [path, value] of Object.entries({
    residents: population.residents, eligible: eligibility.eligible,
    voters: turnout.voters, valid: votes.valid, votesPerVoter: votes.votesPerVoter,
  })) check(value, path);
  assert.ok(population.residents > 0 && votes.votesPerVoter > 0);
  assert.ok([16, 18].includes(data.votingAge), `${data.id}: voting age`);
  assert.ok(turnout.voters <= eligibility.eligible && eligibility.eligible <= population.residents, `${data.id}: voters <= eligible <= residents`);
  assert.equal(eligibility.eligible + eligibility.notEligible, population.residents, `${data.id}: population flow`);
  assert.equal(turnout.voters + turnout.nonVoters, eligibility.eligible, `${data.id}: turnout flow`);
  assert.ok(votes.valid > 0 && votes.valid <= turnout.voters * votes.votesPerVoter, `${data.id}: vote capacity`);
  assert.ok(votes.parties.length > 0);
  const names = new Set();
  for (const party of votes.parties) {
    assert.ok(typeof party.name === 'string' && party.name.trim() && !names.has(party.name), `${data.id}: party name`);
    names.add(party.name);
    check(party.votes, `party ${party.name}`);
  }
  assert.equal(votes.parties.reduce((sum, party) => sum + party.votes, 0), votes.valid, `${data.id}: party vote sum`);
  const breakdown = eligibility.estimatedBreakdown;
  const demographics = population.demographics;
  assert.ok(demographics, `${data.id}: demographic metadata required`);
  for (const key of ['underVotingAge', 'nonGermanVotingAgeOrOlder']) check(demographics[key], key);
  assert.ok(demographics.underVotingAge + demographics.nonGermanVotingAgeOrOlder <= population.residents, `${data.id}: demographic population bounds`);
  assert.ok(['direct', 'estimated'].includes(demographics.method), `${data.id}: demographic method`);
  if (demographics.method === 'estimated') text(demographics.note, 'estimation method note');
  if (breakdown) {
    for (const value of Object.values(breakdown)) check(value, 'eligibility breakdown');
    const knownSplit = breakdown.underVotingAge + breakdown.nonGermanVotingAgeOrOlder;
    assert.equal(breakdown.otherOrTimingDifference, Math.max(0, eligibility.notEligible - knownSplit), `${data.id}: eligibility residual`);
    assert.equal(breakdown.underVotingAge, demographics.underVotingAge, `${data.id}: age count differs from demographics`);
    assert.equal(breakdown.nonGermanVotingAgeOrOlder, demographics.nonGermanVotingAgeOrOlder, `${data.id}: citizenship count differs from demographics`);
    if (knownSplit > eligibility.notEligible) text(eligibility.note, 'overhang explanation');
  } else {
    assert.equal(breakdown, null, `${data.id}: explicitly mark unavailable split`);
    text(eligibility.note, 'unavailable split explanation');
  }
  if (ballots) {
    assert.equal(ballots.valid + ballots.invalid, ballots.total);
    assert.equal(ballots.total + ballots.none, turnout.voters);
    assert.ok(votes.valid <= ballots.valid * votes.votesPerVoter);
  } else {
    for (const key of ['invalid', 'noSecondVote', 'noValidSecondVote']) check(votes[key], key);
    assert.equal(votes.valid + votes.noValidSecondVote, turnout.voters * votes.votesPerVoter);
    assert.equal(votes.invalid + votes.noSecondVote, votes.noValidSecondVote);
  }
  date(data.electionDate, 'election date');
  assert.equal(Number(data.electionDate.slice(0, 4)), data.year);
  date(population.referenceDate, 'population reference date');
  date(demographics.referenceDate, 'demographic reference date');
  text(population.basis, 'population basis');
  // Historical snapshots may follow election day. All timing gaps must be visible.
  text(population.note, 'population timing note');
  if (demographics.referenceDate !== population.referenceDate) {
    text(demographics.note, 'mixed-date explanation');
    assert.ok(demographics.note.includes(demographics.referenceDate), `${data.id}: disclose demographic date`);
  }
  assert.ok(['final', 'preliminary'].includes(data.resultStatus));
  const sourceIds = new Set();
  for (const source of data.sources) {
    text(source.id, 'source id');
    assert.ok(!sourceIds.has(source.id), `${data.id}: duplicate source id`);
    sourceIds.add(source.id);
    assert.equal(new URL(source.url).protocol, 'https:', `${data.id}: source URL`);
    text(source.publisher, 'publisher');
    text(source.file, 'source file');
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
  }
  for (const id of ['results', 'population', population.sourceId]) {
    assert.ok(sourceIds.has(id), `${data.id}: missing source ${id}`);
  }
  assert.ok(Array.isArray(demographics.sourceIds) && demographics.sourceIds.length > 0, `${data.id}: demographic sources required`);
  for (const id of demographics.sourceIds) assert.ok(sourceIds.has(id), `${data.id}: missing demographic source ${id}`);
}
