import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

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

// ponytail: regex XLSX/CSV readers instead of a parser dependency; fine for
// these three fixed files, swap in a library if a sheet layout ever breaks
function xlsxSheets(file) {
  const entry = (name) =>
    execFileSync('unzip', ['-p', file, name], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
  const shared = [...entry('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    (m[1].match(/<t[^>]*>([^<]*)<\/t>/g) ?? [])
      .join('')
      .replace(/<[^>]*>/g, '')
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&apos;', "'"),
  );
  const targets = Object.fromEntries(
    [...entry('xl/_rels/workbook.xml.rels').matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map(
      (m) => [m[1], m[2]],
    ),
  );
  const sheets = {};
  for (const m of entry('xl/workbook.xml').matchAll(/<sheet[^>]*name="([^"]*)"[^>]*r:id="([^"]*)"/g)) {
    const target = targets[m[2]].replace(/^\/?(?:xl\/)?/, '');
    sheets[m[1]] = entry(`xl/${target}`);
  }
  return { shared, sheets };
}

function colIndex(letters) {
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
}

function xlsxRows(xml, shared) {
  return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const cells = {};
    // <c/> may be self-closing; a greedy "until next </c>" would swallow the following cells
    for (const c of rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>(?:(?=<c\b)|$)|>([\s\S]*?)<\/c>)/g)) {
      const inner = c[2] ?? '';
      const ref = c[1].match(/r="([A-Z]+)\d+"/)?.[1];
      if (!ref) continue;
      const type = c[1].match(/t="(\w+)"/)?.[1];
      let value = inner.match(/<v>([^<]*)<\/v>/)?.[1] ?? '';
      if (type === 's' && value) value = shared[Number(value)];
      cells[colIndex(ref)] = value !== '' && !Number.isNaN(Number(value)) ? Number(value) : value;
    }
    return cells;
  });
}

// --- Berlin ---

function berlinData() {
  const rawDirectory = 'data/raw/berlin/2023';
  const sourceFiles = {
    structure: `${rawDirectory}/structure.pdf`,
    population: `${rawDirectory}/population.pdf`,
    results: `${rawDirectory}/results.pdf`,
  };

  const resultText = pdfPage(sourceFiles.results, 128);
  const populationText = pdfPage(sourceFiles.population, 6);
  const structureText = pdfPage(sourceFiles.structure, 15, 17);

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

  return {
    data: {
      id: 'berlin-agh-2023',
      year: 2023,
      title: 'Wiederholungswahl zum Abgeordnetenhaus von Berlin',
      electionDate: '2023-02-12',
      resultStatus: 'final',
      votingAge: 18,
      eyebrow: 'Abgeordnetenhauswahl · Zweitstimme',
      intro:
        'Von allen gemeldeten Einwohner:innen bis zu den gültigen Zweitstimmen bei der Wiederholungswahl am 12. Februar 2023.',
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
        label: 'Gültige Zweitstimmen',
        valid: validSecondVotes,
        votesPerVoter: 1,
        noValidSecondVote,
        invalid: invalidSecondVotes,
        noSecondVote,
        parties,
      },
      sources: null, // filled below
    },
    sourceFiles,
    publisher: 'Amt für Statistik Berlin-Brandenburg',
    license: 'CC BY 3.0 DE',
  };
}

// --- Hamburg ---

function hamburgData() {
  const rawDirectory = 'data/raw/hamburg/2025';
  const sourceFiles = {
    results: `${rawDirectory}/results.pdf`,
    population: `${rawDirectory}/population.xlsx`,
    register: `${rawDirectory}/register.xlsx`,
    foreign: `${rawDirectory}/foreign.xlsx`,
  };

  const resultText = pdfPage(sourceFiles.results, 1);
  const lines = resultText.split('\n');
  const hhCount = (label, { nextLine = false } = {}) => {
    const index = lines.findIndex((line) => line.trimStart().startsWith(label));
    if (index < 0) throw new Error(`Missing row: ${label}`);
    const line = nextLine
      ? lines.slice(index + 1).find((candidate) => /\d/.test(candidate))
      : lines[index];
    return firstCount(line);
  };

  const partyLabels = [
    'SPD',
    'CDU',
    'FDP',
    'GRÜNE',
    'Volt',
    'Die Linke',
    'AfD',
    'DieWahl - WFG',
    'DAVA-Hamburg',
    'FREIE WÄHLER',
    'Die PARTEI',
    'ÖDP',
    'Tierschutzpartei',
    'BÜNDNIS DEUTSCHLAND',
    'BSW',
    'NPD',
  ];
  const parties = partyLabels
    .map((name) => ({ name, votes: hhCount(name) }))
    .sort((a, b) => b.votes - a.votes);

  const eligible = hhCount('Wahlberechtigte');
  const voters = hhCount('Wählende / Wahlbeteiligung', { nextLine: true });
  const ballotsTotal = hhCount('abgegebene Stimmzettel');
  const ballotsInvalid = hhCount('ungültige Stimmzettel');
  const ballotsValid = hhCount('gültige Stimmzettel');
  const validVotes = hhCount('gültige Stimmen / Mandate');

  // Melderegister counts (primary population basis)
  const { shared: registerShared, sheets: registerSheets } = xlsxSheets(sourceFiles.register);
  const registerRows = xlsxRows(registerSheets.T3_1, registerShared);
  const registerTotal = registerRows.find(
    (row) => row[1] === 'zus.' && row[2] > 1_900_000 && row[2] < 2_100_000,
  );
  const residents = registerTotal[2];
  const under18 = registerTotal[3] + registerTotal[4] + registerTotal[5];

  // Single-year ages (Fortschreibung) supply only the under-16 / under-18 ratio
  const { shared: ageShared, sheets: ageSheets } = xlsxSheets(sourceFiles.population);
  const ageRows = xlsxRows(ageSheets.Land_1, ageShared)
    .map((row) => {
      const label = String(row[0] ?? '');
      const age = label.startsWith('Unter 1')
        ? 0
        : (label.match(/^(\d+)/)?.[1] ? Number(label.match(/^(\d+)/)[1]) : null);
      return age !== null && Number.isFinite(row[2]) ? { age, value: row[2] } : null;
    })
    .filter(Boolean);
  const sumAges = (max) =>
    ageRows.filter(({ age }) => age <= max).reduce((sum, { value }) => sum + value, 0);
  const underAgeRatio = sumAges(15) / sumAges(17);

  // Foreign population (Melderegister): total and 0-17 band from the city-total rows
  const { shared: foreignShared, sheets: foreignSheets } = xlsxSheets(sourceFiles.foreign);
  const foreignRows = xlsxRows(foreignSheets.T2_1, foreignShared);
  const femaleTotalIndex = foreignRows.findIndex(
    (row) => String(row[0] ?? '').includes('insgesamt') && row[1] === 'weibl.',
  );
  const maleForeign = foreignRows[femaleTotalIndex - 1];
  const femaleForeign = foreignRows[femaleTotalIndex];
  if (maleForeign?.[1] !== 'männl.') throw new Error('Foreign city-total rows not found');
  const foreignTotal = maleForeign[2] + femaleForeign[2];
  const foreign0to17 = maleForeign[3] + femaleForeign[3];

  const notEligible = residents - eligible;
  const underVotingAge = Math.round(under18 * underAgeRatio);
  const nonGermanUnder16 = Math.round(foreign0to17 * underAgeRatio);
  const nonGermanVotingAgeOrOlder = foreignTotal - nonGermanUnder16;
  const otherOrTimingDifference = notEligible - underVotingAge - nonGermanVotingAgeOrOlder;
  const ballotsNone = voters - ballotsTotal;

  assertEqual(
    parties.reduce((sum, party) => sum + party.votes, 0),
    validVotes,
    'Party Landesstimmen',
  );
  assertEqual(ballotsValid + ballotsInvalid + ballotsNone, voters, 'Ballot flow');
  assertEqual(eligible + notEligible, residents, 'Resident flow');
  assertEqual(voters + (eligible - voters), eligible, 'Eligible flow');
  if (otherOrTimingDifference < 0 || nonGermanUnder16 < 0) {
    throw new Error('Derived residuals must not be negative');
  }

  return {
    data: {
      id: 'hamburg-bue-2025',
      year: 2025,
      title: 'Bürgerschaftswahl in Hamburg',
      electionDate: '2025-03-02',
      resultStatus: 'final',
      votingAge: 16,
      eyebrow: 'Bürgerschaftswahl · Landesstimmen',
      intro:
        'Von allen gemeldeten Einwohner:innen bis zu den gültigen Landesstimmen bei der Bürgerschaftswahl am 2. März 2025.',
      population: {
        residents,
        referenceDate: '2024-12-31',
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
      ballots: {
        total: ballotsTotal,
        valid: ballotsValid,
        invalid: ballotsInvalid,
        none: ballotsNone,
      },
      secondVotes: {
        label: 'Gültige Landesstimmen',
        valid: validVotes,
        votesPerVoter: 5,
        parties,
      },
      unitNote:
        'Jede Wählerin und jeder Wähler hat bis zu 5 Landesstimmen und kann sie auf mehrere Parteien verteilen. Die Parteibänder zählen Stimmen, keine Personen; aus den amtlichen Ergebnissen lässt sich nicht ableiten, wie viele Personen einer Partei zuzurechnen sind.',
      sources: null, // filled below
    },
    sourceFiles,
    publisher: 'Statistisches Amt für Hamburg und Schleswig-Holstein',
    license: 'Datenlizenz Deutschland Namensnennung 2.0',
  };
}

// --- Bremen ---

async function bremenData() {
  const rawDirectory = 'data/raw/bremen/2023';
  const sourceFiles = {
    results: `${rawDirectory}/results.pdf`,
    population: `${rawDirectory}/population.csv`,
  };

  const text = pdfPage(sourceFiles.results, 9, 10);
  const lines = text.split('\n');
  const tableRow = (label) => {
    const re = new RegExp(`^\\s*${label}\\s+\\d`);
    const line = lines.find((candidate) => re.test(candidate));
    if (!line) throw new Error(`Missing row: ${label}`);
    const pairs = line.match(/(\d+(?: \d{3})*)\s+(?:[\d,]+|x)/g);
    if (!pairs) throw new Error(`No counts in row: ${label}`);
    return pairs.map((pair) => pair.match(/(\d+(?: \d{3})*)\s/)[1]);
  };

  const eligible = count(tableRow('Wahlberechtigte')[4]);
  const voters = count(tableRow('Wähler / Wahlbeteiligung')[4]);
  const ballotsInvalid = count(tableRow('ungültige Stimmzettel')[4]);
  const ballotsValid = count(tableRow('gültige Stimmzettel')[4]);
  const validVotes = count(tableRow('Gültige Stimmen\\s')[4]);

  const blockStart = text.indexOf('\nLand Bremen\nGültige Stimmen');
  if (blockStart < 0) throw new Error('Land Bremen results block not found');
  const block = text.slice(blockStart, blockStart + 4000);
  const party = (label) => {
    const match = block.match(
      new RegExp(
        `^\\s*${label}\\s+(\\d+(?: \\d{3})*)\\s+[\\d,]+\\s+(\\d+(?: \\d{3})*)\\s+[\\d,]+\\s+(\\d+(?: \\d{3})*)`,
        'm',
      ),
    );
    if (!match) throw new Error(`Missing party row: ${label}`);
    return count(match[3]);
  };
  const parties = [
    'CDU',
    'SPD',
    'GRÜNE',
    'DIE LINKE',
    'FDP',
    'BIW',
    'Die PARTEI',
    'PIRATEN',
    'dieBasis',
    'GFA',
    'MLPD',
    'MERA25',
    'ÖDP',
    'Verjüngungsforschung',
    'Tierschutzpartei',
    'Volt',
  ]
    .map((name) => ({
      name: name === 'Verjüngungsforschung' ? 'Partei für schulmedizinische Verjüngungsforschung' : name,
      votes: party(name),
    }))
    .sort((a, b) => b.votes - a.votes);

  // Population by single-year age and nationality (Fortschreibung, GENESIS 12411-0014)
  const csv = (await readFile(sourceFiles.population, 'utf8')).split('\n');
  const age = (label) => {
    if (label.startsWith('unter 1')) return 0;
    const years = label.match(/^(\d+)/)?.[1];
    return years ? Number(years) : null;
  };
  const populationRows = csv
    .map((line) => line.split(';'))
    .filter((cells) => cells[0] === '31.12.2022' && age(cells[2] ?? '') !== null);
  const residents = populationRows.reduce((sum, cells) => sum + Number(cells[11]), 0);
  const foreignTotal = populationRows.reduce((sum, cells) => sum + Number(cells[8]), 0);
  const foreignUnder16 = populationRows
    .filter((cells) => age(cells[2]) < 16)
    .reduce((sum, cells) => sum + Number(cells[8]), 0);
  const underVotingAge = populationRows
    .filter((cells) => age(cells[2]) < 16)
    .reduce((sum, cells) => sum + Number(cells[11]), 0);

  const notEligible = residents - eligible;
  const nonGermanVotingAgeOrOlder = foreignTotal - foreignUnder16;
  const otherOrTimingDifference = notEligible - underVotingAge - nonGermanVotingAgeOrOlder;
  const ballotsNone = voters - ballotsValid - ballotsInvalid;

  assertEqual(
    parties.reduce((sum, entry) => sum + entry.votes, 0),
    validVotes,
    'Party votes',
  );
  assertEqual(ballotsValid + ballotsInvalid + ballotsNone, voters, 'Ballot flow');
  assertEqual(eligible + notEligible, residents, 'Resident flow');
  assertEqual(voters + (eligible - voters), eligible, 'Eligible flow');
  if (otherOrTimingDifference < 0 || ballotsNone < 0) {
    throw new Error('Derived residuals must not be negative');
  }

  return {
    data: {
      id: 'bremen-bue-2023',
      year: 2023,
      title: 'Bürgerschaftswahl (Landtag) in Bremen',
      electionDate: '2023-05-14',
      resultStatus: 'final',
      votingAge: 16,
      eyebrow: 'Bürgerschaftswahl · Stimmen',
      intro:
        'Von allen gemeldeten Einwohner:innen bis zu den gültigen Stimmen bei der Bürgerschaftswahl am 14. Mai 2023.',
      population: {
        residents,
        referenceDate: '2022-12-31',
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
      ballots: {
        total: ballotsValid + ballotsInvalid,
        valid: ballotsValid,
        invalid: ballotsInvalid,
        none: ballotsNone,
      },
      secondVotes: {
        label: 'Gültige Stimmen',
        valid: validVotes,
        votesPerVoter: 5,
        parties,
      },
      unitNote:
        'Jede Wählerin und jeder Wähler hat bis zu 5 Stimmen (Listen- und Personenstimmen) und kann sie auf mehrere Parteien verteilen. Die Parteibänder zählen Stimmen, keine Personen; aus den amtlichen Ergebnissen lässt sich nicht ableiten, wie viele Personen einer Partei zuzurechnen sind.',
      sources: null, // filled below
    },
    sourceFiles,
    publisher: 'Statistisches Landesamt Bremen',
    license: 'Datenlizenz Deutschland Namensnennung 2.0',
  };
}

// --- assembly ---

const states = {
  berlin: berlinData(),
  hamburg: hamburgData(),
  bremen: await bremenData(),
};

for (const [state, parsed] of Object.entries(states)) {
  const manifest = JSON.parse(
    await readFile(`data/raw/${state}/${parsed.data.year}/sources.json`, 'utf8'),
  );
  const manifestSources = Object.fromEntries(
    manifest.sources.map((source) => [source.id, source]),
  );
  parsed.data.sources = await Promise.all(
    Object.entries(parsed.sourceFiles).map(async ([id, file]) => {
      const sha256 = createHash('sha256').update(await readFile(file)).digest('hex');
      assertEqual(sha256, manifestSources[id].sha256, `${state} ${id} checksum`);
      return {
        ...manifestSources[id],
        retrievedAt: manifest.retrievedAt,
        publisher: parsed.publisher,
        license: parsed.license,
      };
    }),
  );

  const year = parsed.data.year;
  await mkdir(`public/data/${state}`, { recursive: true });
  await writeFile(
    `public/data/${state}/${year}.json`,
    `${JSON.stringify(parsed.data, null, 2)}\n`,
  );
  console.log(`Validated and wrote public/data/${state}/${year}.json`);
}
