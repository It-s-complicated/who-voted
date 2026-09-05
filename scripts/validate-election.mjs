import assert from 'node:assert/strict';

export function validateElection(data) {
  const check = (value, path) => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, `${data.id}: ${path} must be a nonnegative integer`);
  };
  const { population, eligibility, turnout, secondVotes: votes, ballots } = data;
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
  if (breakdown) {
    for (const value of Object.values(breakdown)) check(value, 'eligibility breakdown');
    assert.equal(breakdown.underVotingAge + breakdown.nonGermanVotingAgeOrOlder + breakdown.otherOrTimingDifference, eligibility.notEligible);
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
  assert.match(data.electionDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(Number(data.electionDate.slice(0, 4)), data.year);
  assert.match(population.referenceDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(population.referenceDate <= data.electionDate);
  assert.ok(['final', 'preliminary'].includes(data.resultStatus));
  for (const id of ['results', 'population']) {
    const source = data.sources.find((source) => source.id === id);
    assert.ok(source?.url.startsWith('https://') && source.publisher && source.file, `${data.id}: ${id} source`);
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
  }
}
