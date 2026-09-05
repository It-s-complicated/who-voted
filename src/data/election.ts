export interface ElectionData {
  id: string;
  year: number;
  title: string;
  electionDate: string;
  resultStatus: 'final' | 'preliminary';
  votingAge: number;
  eyebrow: string;
  intro: string;
  population: { residents: number; referenceDate: string; basis?: string };
  eligibility: {
    eligible: number;
    notEligible: number;
    estimatedBreakdown: {
      underVotingAge: number;
      nonGermanVotingAgeOrOlder: number;
      otherOrTimingDifference: number;
    } | null;
    note?: string;
  };
  turnout: { voters: number; nonVoters: number };
  secondVotes: {
    label: string;
    valid: number;
    votesPerVoter: number;
    noValidSecondVote?: number;
    noValidLabel?: string;
    invalid?: number;
    noSecondVote?: number;
    parties: { name: string; votes: number }[];
  };
  ballots?: { total: number; valid: number; invalid: number; none: number };
  unitNote?: string;
  sources: { id: string; url: string; file: string; sha256: string; publisher: string; location?: string }[];
}
