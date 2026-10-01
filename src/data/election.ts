import { z } from "astro/zod";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const text = z.string().trim().min(1);
const date = z.iso.date();

export const electionSchema = z.object({
  id: text,
  state: z.object({ slug: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/), name: text }),
  previousParliament: z.array(text).min(1),
  year: count,
  title: text,
  electionDate: date,
  resultStatus: z.enum(["final", "preliminary"]),
  votingAge: z.union([z.literal(16), z.literal(18)]),
  eyebrow: text,
  intro: text,
  population: z.object({
    residents: count.positive(),
    referenceDate: date,
    basis: text,
    sourceId: text,
    note: text,
    demographics: z.object({
      referenceDate: date,
      underVotingAge: count,
      nonGermanVotingAgeOrOlder: count,
      method: z.enum(["direct", "estimated"]),
      sourceIds: z.array(text).min(1),
      note: text.optional(),
    }),
  }),
  eligibility: z.object({
    eligible: count,
    notEligible: count,
    estimatedBreakdown: z
      .object({
        underVotingAge: count,
        nonGermanVotingAgeOrOlder: count,
        otherOrTimingDifference: count,
      })
      .nullable(),
    note: text.optional(),
  }),
  turnout: z.object({ voters: count, nonVoters: count }),
  secondVotes: z.object({
    label: text,
    valid: count.positive(),
    votesPerVoter: count.positive(),
    noValidSecondVote: count.optional(),
    noValidLabel: text.optional(),
    invalid: count.optional(),
    noSecondVote: count.optional(),
    parties: z.array(z.object({ name: text, votes: count })).min(1),
  }),
  ballots: z.object({ total: count, valid: count, invalid: count, none: count }).optional(),
  unitNote: text.optional(),
  // Keep additional provenance supplied by source manifests.
  sources: z
    .array(
      z.looseObject({
        id: text,
        url: z.url({ protocol: /^https$/ }),
        file: text,
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        publisher: text,
        location: text.optional(),
      }),
    )
    .min(1),
}).superRefine((data, context) => {
  const { population, eligibility, turnout, secondVotes: votes, ballots } = data;
  function check(condition: boolean, message: string) {
    if (!condition) context.addIssue({ code: "custom", message: `${data.id}: ${message}` });
  }
  check(turnout.voters <= eligibility.eligible && eligibility.eligible <= population.residents,
    "voters <= eligible <= residents");
  check(eligibility.eligible + eligibility.notEligible === population.residents, "population flow");
  check(turnout.voters + turnout.nonVoters === eligibility.eligible, "turnout flow");
  check(votes.valid <= turnout.voters * votes.votesPerVoter, "vote capacity");
  check(new Set(votes.parties.map((party) => party.name)).size === votes.parties.length, "duplicate party name");
  check(votes.parties.reduce((sum, party) => sum + party.votes, 0) === votes.valid, "party vote sum");

  const demographics = population.demographics;
  check(demographics.underVotingAge + demographics.nonGermanVotingAgeOrOlder <= population.residents,
    "demographic population bounds");
  if (demographics.method === "estimated") check(Boolean(demographics.note), "missing estimation method note");
  const breakdown = eligibility.estimatedBreakdown;
  if (breakdown) {
    const knownSplit = breakdown.underVotingAge + breakdown.nonGermanVotingAgeOrOlder;
    check(breakdown.otherOrTimingDifference === Math.max(0, eligibility.notEligible - knownSplit), "eligibility residual");
    check(breakdown.underVotingAge === demographics.underVotingAge, "age count differs from demographics");
    check(breakdown.nonGermanVotingAgeOrOlder === demographics.nonGermanVotingAgeOrOlder,
      "citizenship count differs from demographics");
    if (knownSplit > eligibility.notEligible) check(Boolean(eligibility.note), "missing overhang explanation");
  } else {
    check(Boolean(eligibility.note), "missing unavailable split explanation");
  }

  if (ballots) {
    check(ballots.valid + ballots.invalid === ballots.total, "ballot total");
    check(ballots.total + ballots.none === turnout.voters, "ballot turnout");
    check(votes.valid <= ballots.valid * votes.votesPerVoter, "valid ballot vote capacity");
  } else {
    check(votes.invalid !== undefined && votes.noSecondVote !== undefined && votes.noValidSecondVote !== undefined,
      "missing invalid or uncast vote counts");
    check(votes.noValidSecondVote !== undefined && votes.valid + votes.noValidSecondVote === turnout.voters * votes.votesPerVoter,
      "vote flow");
    check(votes.invalid !== undefined && votes.noSecondVote !== undefined && votes.invalid + votes.noSecondVote === votes.noValidSecondVote,
      "invalid and uncast vote flow");
  }
  check(Number(data.electionDate.slice(0, 4)) === data.year, "election date/year mismatch");
  if (demographics.referenceDate !== population.referenceDate) {
    check(Boolean(demographics.note?.includes(demographics.referenceDate)), "missing demographic date explanation");
  }

  const sourceIds = new Set(data.sources.map((source) => source.id));
  check(sourceIds.size === data.sources.length, "duplicate source id");
  for (const id of ["results", "population", population.sourceId, ...demographics.sourceIds]) {
    check(sourceIds.has(id), `missing source ${id}`);
  }
});

export type ElectionData = z.infer<typeof electionSchema>;
