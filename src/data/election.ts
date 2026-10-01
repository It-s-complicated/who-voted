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
    residents: count,
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
    valid: count,
    votesPerVoter: count,
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
});

export type ElectionData = z.infer<typeof electionSchema>;
