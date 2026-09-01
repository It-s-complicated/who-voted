import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const rawDirectory = 'data/raw/2023';
const sourceFiles = {
  structure: `${rawDirectory}/structure.pdf`,
  population: `${rawDirectory}/population.pdf`,
  results: `${rawDirectory}/results.pdf`,
};

function pdfPage(file, firstPage, lastPage = firstPage) {
  return execFileSync(
    'pdftotext',
    ['-f', String(firstPage), '-l', String(lastPage), '-layout', file, '-'],
    { encoding: 'utf8' },
  );
}

function count(value) {
  return Number(value.replaceAll(' ', ''));
}

function firstCount(line) {
  const value = line.match(/\d+(?: \d{3})*/)?.[0];
  if (!value) throw new Error(`No count found in: ${line}`);
  return count(value);
}

function lineStartingWith(text, label) {
  const line = text.split('\n').find((candidate) => candidate.trimStart().startsWith(label));
  if (!line) throw new Error(`Missing row: ${label}`);
  return line.trimStart().slice(label.length);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: ${actual} !== ${expected}`);
}

const resultText = pdfPage(sourceFiles.results, 128);
const populationText = pdfPage(sourceFiles.population, 6);
const structureText = pdfPage(sourceFiles.structure, 15, 17);
const manifest = JSON.parse(await readFile(`${rawDirectory}/sources.json`, 'utf8'));
const manifestSources = Object.fromEntries(manifest.sources.map((source) => [source.id, source]));

const parties = [
  ['SPD', 'SPD'],
  ['CDU', 'CDU'],
  ['GRÜNE', 'GRÜNE'],
  ['DIE LINKE', 'DIE LINKE'],
  ['AfD', 'AfD'],
  ['FDP', 'FDP'],
  ['Die PARTEI', 'Die PARTEI'],
  ['Tierschutzpartei', 'Tierschutzpartei'],
  ['PIRATEN', 'PIRATEN'],
  ['Graue Panther', 'Graue Panther'],
  ['NPD', 'NPD'],
  ['Gesundheitsforschung', 'Gesundheitsforschung'],
  ['LKR', 'LKR'],
  ['DKP', 'DKP'],
  ['SGP', 'SGP'],
  ['BüSo', 'BüSo'],
  ['MENSCHLICHE WELT', 'MENSCHLICHE WELT'],
  ['B*', 'B*'],
  ['ÖDP', 'ÖDP'],
  ['dieBasis', 'dieBasis'],
  ['Bildet Berlin!', 'Bildet Berlin!'],
  ['Deutsche Konservative', 'Deutsche Konservative'],
  ['Die Grauen', 'Die Grauen'],
  ['Neue Demokraten', 'Neue Demokraten'],
  ['REP', 'REP'],
  ['du.', 'du.'],
  ['BÜNDNIS21', 'BÜNDNIS21'],
  ['FREIE WÄHLER', 'FREIE WÄHLER'],
  ['Klimaliste Berlin', 'Klimaliste Berlin'],
  ['MIETERPARTEI', 'MIETERPARTEI'],
  ['Die Humanisten', 'Die Humanisten'],
  ['Team Todenhöfer', 'Team Todenhöfer'],
  ['Volt', 'Volt'],
]
  .map(([sourceLabel, name]) => ({
    name,
    votes: firstCount(lineStartingWith(resultText, sourceLabel)),
  }))
  .sort((a, b) => b.votes - a.votes);

const eligible = firstCount(lineStartingWith(resultText, 'Wahlberechtigte'));
const voters = firstCount(lineStartingWith(resultText, 'Wählende'));
const invalidSecondVotes = firstCount(lineStartingWith(resultText, 'Ungültige Stimmen'));
const validSecondVotes = firstCount(lineStartingWith(resultText, 'Gültige Stimmen'));

const berlinLine = lineStartingWith(populationText, 'Berlin');
const residents = firstCount(berlinLine);
const under18Rows = populationText
  .split('\n')
  .filter((line) => line.trimStart().startsWith('unter 18'));
const germanUnder18 = firstCount(under18Rows[0].trimStart().slice('unter 18'.length));
const nonGermanUnder18 = firstCount(under18Rows[1].trimStart().slice('unter 18'.length));
const underVotingAge = firstCount(under18Rows[2].trimStart().slice('unter 18'.length));
const nonGermanTotal = firstCount(
  populationText
    .split(/\n\s*Ausländer\s*\n/)[1]
    .split(/\n\s*insgesamt\s*\n/)[0]
    .split('\n')
    .find((line) => line.trimStart().startsWith('Zusammen')),
);

const structureResidents = structureText
  .split('\n')
  .filter((line) => line.trimStart().startsWith('Insgesamt'))
  .reduce((sum, line) => sum + firstCount(line.trimStart().slice('Insgesamt'.length)), 0);

const partyVotes = parties.reduce((sum, party) => sum + party.votes, 0);
const nonGermanVotingAgeOrOlder = nonGermanTotal - nonGermanUnder18;
const notEligible = residents - eligible;
const otherOrTimingDifference = notEligible - underVotingAge - nonGermanVotingAgeOrOlder;
const noValidSecondVote = voters - validSecondVotes;
const noSecondVote = noValidSecondVote - invalidSecondVotes;

assertEqual(germanUnder18 + nonGermanUnder18, underVotingAge, 'Under-18 population');
assertEqual(partyVotes, validSecondVotes, 'Party second votes');
assertEqual(eligible + notEligible, residents, 'Resident flow');
assertEqual(voters + (eligible - voters), eligible, 'Eligible flow');
assertEqual(validSecondVotes + noValidSecondVote, voters, 'Voter flow');
if (otherOrTimingDifference < 0 || noSecondVote < 0) {
  throw new Error('Derived residuals must not be negative');
}

const data = {
  id: 'berlin-agh-2023',
  year: 2023,
  title: 'Wiederholungswahl zum Abgeordnetenhaus von Berlin',
  electionDate: '2023-02-12',
  resultStatus: 'final',
  votingAge: 18,
  population: {
    residents,
    referenceDate: '2022-12-31',
    structureResidents,
    structureReferenceDate: '2022-06-30',
  },
  eligibility: {
    eligible,
    notEligible,
    estimatedBreakdown: {
      underVotingAge,
      nonGermanVotingAgeOrOlder,
      otherOrTimingDifference,
    },
  },
  turnout: {
    voters,
    nonVoters: eligible - voters,
  },
  secondVotes: {
    valid: validSecondVotes,
    noValidSecondVote,
    invalid: invalidSecondVotes,
    noSecondVote,
    parties,
  },
  sources: await Promise.all(Object.entries(sourceFiles).map(async ([id, file]) => {
    const sha256 = createHash('sha256').update(await readFile(file)).digest('hex');
    assertEqual(sha256, manifestSources[id].sha256, `${id} checksum`);
    return {
      ...manifestSources[id],
      retrievedAt: manifest.retrievedAt,
      publisher: 'Amt für Statistik Berlin-Brandenburg',
      license: 'CC BY 3.0 DE',
    };
  })),
};

// ponytail: direct PDF-to-JSON is enough for one election; add SQLite with the second year.
await mkdir('public/data', { recursive: true });
await writeFile('public/data/2023.json', `${JSON.stringify(data, null, 2)}\n`);
console.log('Validated and wrote public/data/2023.json');
