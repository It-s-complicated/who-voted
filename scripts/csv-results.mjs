import assert from 'node:assert/strict';
import { parse } from 'csv-parse/sync';

// CSV is a transport, not a shared election layout. Publishers mix vote
// categories, previous elections, mail subtotals and aggregation levels. Each
// parser below names the required selection; see CSV_AVAILABILITY_REVIEW.md.

function count(value, label) {
  assert.match(value ?? '', /^\d+$/, `Invalid ${label}`);
  const number = Number(value);
  assert.ok(Number.isSafeInteger(number), `Unsafe ${label}`);
  return number;
}

function table(rows, firstHeader) {
  const index = rows.findIndex((row) => row[0] === firstHeader);
  assert.ok(index >= 0, `Missing result headers: ${firstHeader}`);
  return { headers: rows[index], rows: rows.slice(index + 1) };
}

function selected(headers, rows, predicate) {
  const matches = rows.filter(predicate);
  assert.equal(matches.length, 1, 'Unique statewide result');
  const [row] = matches;
  assert.equal(row.length, headers.length, 'Result column count');
  return {
    row,
    value: (name) => count(row[column(headers, name)], name),
    party: (name, index) => ({ name, votes: count(row[index], name) }),
  };
}

function column(headers, name) {
  const indices = headers.flatMap((header, index) => header === name ? [index] : []);
  assert.equal(indices.length, 1, `Unique result column: ${name}`);
  return indices[0];
}

function badenWuerttembergResults(data) {
  // LAND already includes every constituency; summing mixed levels doubles votes.
  const { headers, rows } = table(data, 'Wahlkreisnummer');
  const { value, party } = selected(headers, rows, (r) => r[4] === 'BW' && r[5] === 'LAND');
  assert.equal(value('gemeldete Wahlbezirke'), value('Anzahl Wahlbezirke'), 'Complete count');
  assert.equal(value('Anzahl Wahlbezirke'), 11570);
  const names = ['GRÜNE', 'CDU', 'SPD', 'FDP', 'AfD', 'Die Linke', 'FREIE WÄHLER', 'Die PARTEI', 'dieBasis', 'KlimalisteBW', 'ÖDP', 'Volt', 'Bündnis C', 'PdH', 'Verjüngungsforschung', 'BSW', 'Die Gerechtigkeitspartei', 'PDR', 'PdF', 'Tierschutzpartei', 'WerteUnion'];
  // F codes follow the official LTW26-Hinweise-DSB column dictionary.
  const parties = names.map((name, i) => party(name, column(headers, `F${i + 1}`)));
  const eligible = value('Wahlberechtigte gesamt (A)'), voters = value('Waehler gesamt (B)');
  const valid = value('Zweitstimmen gueltige (F)'), invalid = value('Zweitstimmen ungueltige (E)');
  return { eligible, voters, valid, invalid, parties };
}

function bayernResults(data) {
  // Bayern counts first + second votes. Current-year Gesamtstimmen columns
  // exclude the repeated Parteiname fields and previous-election results.
  const { headers, rows } = table(data, 'Schlüsselnummer');
  const { row, value, party } = selected(headers, rows, (r) => r[0] === '990');
  assert.equal(value('Zahl der ausgewerteten Stimmkreise'), 91, 'Complete count');
  assert.equal(value('Zahl der Stimmkreise insgesamt'), 91);
  const parties = headers.flatMap((h, i) => {
    if (h === 'Gesamtstimmen Sonstige 2018 2023') {
      assert.equal(row[i], 'X', 'Historical-only party column');
      return [];
    }
    return h.startsWith('Gesamtstimmen ') && h.endsWith(' 2023')
      ? [party(h.slice(14, -5), i)] : [];
  });
  const eligible = value('Stimmberechtigte'), voters = value('Wähler');
  const valid = value('gültige Gesamtstimmen insgesamt 2023'), invalid = value('ungültige Gesamtstimmen 2023');
  return { eligible, voters, valid, invalid, parties };
}

function hessenResults(data) {
  const { headers, rows } = table(data, 'Gebietsschlüssel');
  assert.ok(data[0][0].startsWith('Landtagswahl 2023'), 'Election year');
  const { row, value, party } = selected(headers, rows, (r) => r[0] === '00000000000' && r[2] === 'LD');
  assert.equal(value('Anzahl Wahlbezirke'), 6889);
  assert.equal(value('Anzahl Wahlbezirke ausgezählt'), 6889, 'Complete count');
  // Landesstimmen are the displayed category; blank columns belong to
  // direct-only candidates. The shortened KLIMALISTE label is an alias.
  const parties = headers.flatMap((h, i) => h.endsWith(' Landesstimmen')
    && !['gültige Landesstimmen', 'ungültige Landesstimmen'].includes(h) && row[i] !== ''
    ? [party(h.slice(0, -14).replace('KLIMALISTE WÄHLERL.', 'KLIMALISTE WÄHLERLISTE'), i)] : []);
  const eligible = value('Wahlberechtigte'), voters = value('Wählerinnen und Wähler');
  const valid = value('gültige Landesstimmen'), invalid = value('ungültige Landesstimmen');
  return { eligible, voters, valid, invalid, parties };
}

function mecklenburgVorpommernResults(data) {
  const { headers, rows } = table(data, 'Berechnungsdatum');
  assert.ok(data[0][0].includes('26. September 2021'), 'Election year');
  const { row, value, party } = selected(headers, rows, (r) => r[1] === 'A' && r[2] === '99' && r[9] === '2');
  assert.equal(value('Wahlbezirke insg.'), 2003);
  assert.equal(value('Erf. Wahlbezirke'), 2003, 'Complete count');
  // The statewide second-vote row marks direct candidates as x.
  const parties = headers.slice(12).flatMap((h, i) => {
    if (row[i + 12] === 'x') {
      assert.equal(h, 'Einzelbewerber', 'Nonapplicable second-vote candidate');
      return [];
    }
    return [party(h.replace(/\s+/g, ' '), i + 12)];
  });
  const eligible = value('Wahlberechtigte'), voters = value('Wähler');
  const valid = value('Gültige Stimmen'), invalid = value('Ungültige Stimmen');
  return { eligible, voters, valid, invalid, parties };
}

function nordrheinWestfalenResults(data) {
  // Two header rows: short F codes supply positions, the preceding row
  // supplies party names. F30+ are candidates without second-vote lists.
  assert.equal(data[0][0], 'Landtagswahl am 15.05.2022 in NRW');
  assert.equal(data[1][0], 'Endgültige Ergebnisse');
  const headers = data[4];
  const rows = data.slice(5);
  const { row, value, party } = selected(headers, rows, (r) => r[0] === 'LW22' && r[1] === '000');
  const parties = headers.flatMap((h, i) => /^F\d+$/.test(h) && row[i] !== ''
    ? [party(data[3][i].replace(/ \[Z\]$/, ''), i)] : []);
  const eligible = value('A'), voters = value('B'), valid = value('F'), invalid = value('E');
  return { eligible, voters, valid, invalid, parties };
}

function rheinlandPfalzResults(data) {
  const { headers, rows } = table(data, 'Identifikationsschlüssel');
  const { row, value, party } = selected(headers, rows, (r) => r[0] === '0' && r[2] === 'LD' && r[4] === 'G');
  // Duplicate party headings occur in both vote sections. This positional
  // range follows SatzbeschreibungErgebnisseGesamtLW_2026; guard its bounds.
  assert.equal(headers[117], 'ungültige Landesstimmen');
  assert.equal(headers[119], 'gültige Landesstimmen');
  assert.equal(headers[121], 'SPD'); assert.equal(headers[151], 'Die PARTEI');
  const parties = headers.slice(121, 153).flatMap((h, i) => i % 2 === 0 && row[121 + i] !== '' ? [party(h, 121 + i)] : []);
  const eligible = value('A'), voters = value('B');
  const valid = value('gültige Landesstimmen'), invalid = value('ungültige Landesstimmen');
  return { eligible, voters, valid, invalid, parties };
}

function saarlandResults(data) {
  assert.equal(data[0][0], 'Landtagswahl 2022'); assert.equal(data[1][0], 'Amtliches Endergebnis');
  const headers = data[2];
  const rows = data.slice(5);
  const { value, party } = selected(headers, rows, (r) => r[0] === '10');
  // Endgültig/Vorperiode alternate. Match the full party labels, including
  // ÖDP and Partei der Humanisten (the old HTML introduced two typos).
  const names = ['CDU', 'SPD', 'DIE LINKE', 'AfD', 'GRÜNE', 'FDP', 'FAMILIE', 'PIRATEN', 'FREIE WÄHLER', 'dieBasis', 'bunt.saar', 'ÖDP', 'Die Humanisten', 'Die PARTEI', 'Gesundheitsforschung', 'Tierschutzpartei', 'SGV', 'Volt'];
  const parties = names.map((name, i) => {
    assert.equal(data[4][3 + i * 2], 'Endgültig', 'Current result column');
    assert.ok(headers[3 + i * 2], 'Full party name');
    return party(name, 3 + i * 2);
  });
  assert.equal(headers[25], 'Ökologisch-Demokratische Partei');
  assert.equal(headers[27], 'Partei der Humanisten');
  const eligible = value('Wahlberechtigte'), voters = value('Wähler');
  const valid = value('Gültige Stimmen'), invalid = value('Ungültige Stimmen');
  return { eligible, voters, valid, invalid, parties };
}

function sachsenAnhaltResults(data, newer) {
  const { headers, rows } = table(data, 'Ergebnisart');
  // Empty Wahllokal is the combined row; U/B are subtotals, not additional
  // votes. 2021 has no Wahllokal column and uses a different header separator.
  const { row, value, party } = selected(headers, rows, (r) => r[0] === 'E'
    && r[column(headers, 'Satzart')] === 'LAN'
    && r[column(headers, 'Schlüsselnummer')] === '15'
    && (!newer || r[column(headers, 'Wahllokal')] === ''));
  assert.equal(row[column(headers, 'Datum')], newer ? '06.09.2026' : '06.06.2021');
  const parties = headers.flatMap((h, i) => /^F\d+[. ]/.test(h)
    ? [party(h.replace(/^F\d+(?:\. |\.| - )/, '').trim().replace(/^TIERSCHUTZ hier!$/, 'Tierschutz hier!'), i)] : []);
  const separator = newer ? '.' : ' - ';
  const eligible = value(`A${separator}Wahlberechtigte`), voters = value(`B${separator}Wähler`);
  const valid = value(newer ? 'F.Gültige.Zweitstimmen' : 'F - Gültige Zweitstimmen');
  const invalid = value(newer ? 'E.Ungültige.Zweitstimmen' : 'E - Ungültige Zweitstimmen');
  return { eligible, voters, valid, invalid, parties };
}

function districtResults(data, niedersachsen) {
  const { headers, rows } = table(data, 'Wahlkreis');
  for (const r of rows) assert.equal(r.length, headers.length, 'Result column count');
  if (niedersachsen) {
    // No statewide row: use all 87 distinct constituencies, second votes II.
    assert.equal(rows.length, 87, 'Complete count');
    assert.deepEqual(rows.map((r) => count(r[0], 'Wahlkreis')).sort((a, b) => a - b), Array.from({ length: 87 }, (_, i) => i + 1));
  } else {
    // Only polling/mail district records; a constituency+municipality+type
    // key prevents duplicate totals while allowing local district numbers.
    assert.equal(rows.length, 2909, 'Complete count');
    assert.equal(new Set(rows.map((r) => JSON.stringify(r.slice(0, 4)))).size, rows.length, 'Unique voting districts');
    for (const r of rows) assert.ok(['STIMMBEZIRK', 'BRIEFWAHLBEZIRK'].includes(r[2]), 'District type');
  }
  // Only blank party cells mean nonparticipation; blank electoral-roll or
  // vote totals are missing data and must fail rather than silently add zero.
  const sum = (index, allowBlank = false) => rows.reduce((total, r) => total + count(allowBlank && r[index] === '' ? '0' : r[index], headers[index]), 0);
  const total = (name) => sum(column(headers, name));
  const eligible = total(niedersachsen ? 'Wahlberechtigte' : 'Wahlberechtigte gesamt (A)');
  const voters = total(niedersachsen ? 'Wähler' : 'Waehlende gesamt (B)');
  const valid = total(niedersachsen ? 'Gültige Zweitstimmen' : 'Listenstimmen gueltige (F)');
  // Niedersachsen omits invalid counts. The importer supplies them from
  // retained official HTML instead of assuming voter-minus-valid is invalid.
  const invalid = niedersachsen ? undefined : total('Listenstimmen ungueltige (E)');
  const names = ['CDU', 'SPD', 'GRÜNE', 'FDP', 'AfD', 'DIE LINKE', 'SSW', 'PIRATEN', 'FREIE WÄHLER', 'Die PARTEI', 'Z.', 'dieBasis', 'Die Humanisten', 'Gesundheitsforschung', 'Tierschutzpartei', 'Volt'];
  const parties = niedersachsen ? headers.flatMap((h, i) => h.endsWith(' II') && sum(i, true) > 0 ? [{ name: h.slice(0, -3), votes: sum(i, true) }] : [])
    : names.map((name, i) => ({ name, votes: total(`F${i + 1}`) }));
  return { eligible, voters, valid, invalid, parties };
}

function hamburgResults(data) {
  // The ZIP's Tabelle1.csv is a formatted, multiline table. Column 1 is
  // Landesliste; Wahlkreislisten and Heilungsregel subtotals must not be added.
  assert.ok(data.some((r) => r.some((cell) => cell.includes('2025'))), 'Election year');
  const tableValue = (label) => {
    const matches = data.filter((r) => r[0]?.trim() === label);
    assert.equal(matches.length, 1, `Unique Hamburg row: ${label}`);
    return count(matches[0][1].trim(), label);
  };
  const names = ['SPD', 'CDU', 'FDP', 'GRÜNE', 'Volt', 'Die Linke', 'AfD', 'DieWahl - WFG', 'DAVA-Hamburg', 'FREIE WÄHLER', 'Die PARTEI', 'ÖDP', 'Tierschutzpartei', 'BÜNDNIS DEUTSCHLAND', 'BSW', 'NPD'];
  const parties = names.map((name) => ({ name, votes: tableValue(name) }));
  const eligible = tableValue('Wahlberechtigte'), voters = tableValue('Wählende / Wahlbeteiligung');
  const valid = tableValue('gültige Stimmen / Mandate');
  const ballots = { total: tableValue('abgegebene Stimmzettel'), valid: tableValue('gültige Stimmzettel'), invalid: tableValue('ungültige Stimmzettel') };
  ballots.none = voters - ballots.total;
  return { eligible, voters, valid, invalid: undefined, parties, ballots };
}

function officialCsvResults(route, text) {
  // BW/NRW have unescaped quotes in unquoted fields; Hamburg/RLP need strict
  // quoting for multiline cells. Keep these publisher exceptions explicit.
  // Preambles/table captions have different widths. Keep arrays (duplicate party
  // headings are real), then validate the selected data rows against their header.
  const data = parse(text, {
    delimiter: route === 'hamburg/2025' ? ',' : ';',
    bom: true, record_delimiter: ['\r\n', '\n', '\r'],
    skip_empty_lines: true, relax_column_count: true,
    relax_quotes: ['baden-wuerttemberg/2026', 'nordrhein-westfalen/2022'].includes(route),
  });
  switch (route) {
    case 'baden-wuerttemberg/2026': return badenWuerttembergResults(data);
    case 'bayern/2023': return bayernResults(data);
    case 'hessen/2023': return hessenResults(data);
    case 'mecklenburg-vorpommern/2021': return mecklenburgVorpommernResults(data);
    case 'nordrhein-westfalen/2022': return nordrheinWestfalenResults(data);
    case 'rheinland-pfalz/2026': return rheinlandPfalzResults(data);
    case 'saarland/2022': return saarlandResults(data);
    case 'sachsen-anhalt/2021': return sachsenAnhaltResults(data, false);
    case 'sachsen-anhalt/2026': return sachsenAnhaltResults(data, true);
    case 'niedersachsen/2022': return districtResults(data, true);
    case 'schleswig-holstein/2022': return districtResults(data, false);
    case 'hamburg/2025': return hamburgResults(data);
    default: assert.fail(`Unsupported CSV election: ${route}`);
  }
}

// Berlin 2026 needs a separate party-code dictionary; both preliminary exports
// also pin the reviewed snapshot dates below. Keep result parsing importable so
// checks can exercise these assumptions without running the data-build assembly.
function preliminaryCsvResults(route, text, description) {
  const berlin = route === 'berlin/2026';
  // MV 2026's preamble is plain prose (including unescaped quotes around a
  // party name), not CSV records. Start at the actual header as its spec requires.
  const header = berlin ? 'Adresse' : 'Berechnungsdatum';
  const start = text.indexOf(`${header};`);
  assert.ok(start >= 0, 'Missing result headers');
  const { headers, rows: data } = table(parse(text.slice(start), {
    delimiter: ';', bom: true, record_delimiter: ['\r\n', '\n', '\r'],
    skip_empty_lines: true, relax_column_count: true,
  }), header);
  assert.equal(new Set(headers).size, headers.length, 'Unique result headers');
  const rows = data.map((cells) => {
    assert.equal(cells.length, headers.length, 'Result column count');
    return Object.fromEntries(headers.map((key, index) => [key, cells[index]]));
  });
  const statewide = rows.filter((row) => berlin
    ? row.Adresse === 'GI9900' && row.StimmArt === '2'
    : row.Wahlkreis === '99' && row.Ausgabe === 'A' && row['Erst-/Zweitstimme'] === '2');
  assert.equal(statewide.length, 1, 'Unique statewide second-vote result');
  const [row] = statewide;
  const value = (key) => count(row[key], key);
  assert.equal(row[berlin ? 'Gebietsname' : 'Wahlkreisname/Land'], berlin ? 'Berlin' : 'Mecklenburg-Vorpommern');
  // Pin the retained preliminary snapshots and district totals: a newer or
  // partial export must be reviewed before it can replace the verified input.
  // Berlin's Datum is YY.MM.DD, per the retained data dictionary.
  assert.match(row[berlin ? 'Datum' : 'Berechnungsdatum'], berlin ? /^26\.09\.21$/ : /^21\.09\.2026 /);
  assert.equal(value(berlin ? 'AnzWbez' : 'Wahlbezirke insg.'), berlin ? 4114 : 1974);
  assert.equal(value(berlin ? 'AusWbez' : 'Erf. Wahlbezirke'), berlin ? 4114 : 1974, 'Complete count');
  // Berlin's dictionary contains prose with literal, unescaped quotation marks
  // in unquoted fields; retain those characters while reading its P-code rows.
  const names = Object.fromEntries(parse(description, {
    delimiter: ';', bom: true, record_delimiter: ['\r\n', '\n', '\r'],
    skip_empty_lines: true, relax_column_count: true, relax_quotes: true,
  }));
  const shortNames = { P01: 'CDU', P02: 'SPD', P03: 'GRÜNE', P04: 'Die Linke', P05: 'AfD', P06: 'FDP', P07: 'Tierschutzpartei', P08: 'Die PARTEI', P09: 'Volt', P12: 'Die Urbane.', P13: 'DKP', P14: 'ÖDP', P15: 'Die Heimat', P16: 'Bergpartei', P17: 'SGP', P24: 'BSW', P27: 'PdF' };
  const partyColumns = berlin ? headers.filter((key) => /^P\d+$/.test(key)) : headers.slice(12);
  const parties = partyColumns.flatMap((key) => {
    // MV marks candidates without a second-vote list as "x", not a vote count.
    if (!berlin && row[key] === 'x') {
      assert.ok(['LfK', 'Einzelbewerber'].includes(key), 'Only direct candidates have no second votes');
      return [];
    }
    const votes = value(key);
    // Berlin includes unused party-code columns; verify zero before omitting them.
    if (berlin && names[key]?.startsWith('nicht besetzt')) {
      assert.equal(votes, 0, 'Unoccupied party code');
      return [];
    }
    if (berlin) assert.ok(names[key], `Missing party definition ${key}`);
    return [{ name: berlin ? shortNames[key] ?? names[key] : key, votes }];
  });
  const eligible = value(berlin ? 'WberIns' : 'Wahlberechtigte');
  const voters = value(berlin ? 'Waehler' : 'Wähler');
  const invalid = value(berlin ? 'Unguelt' : 'Ungültige Stimmen');
  const valid = value(berlin ? 'Gueltig' : 'Gültige Stimmen');
  assert.equal(valid + invalid, voters, 'Second-vote total');
  return { eligible, voters, invalid, valid, parties };
}

export function parseCsvResults(route, text, description = '') {
  const results = ['berlin/2026', 'mecklenburg-vorpommern/2026'].includes(route)
    ? preliminaryCsvResults(route, text, description)
    : officialCsvResults(route, text);
  assert.equal(new Set(results.parties.map((party) => party.name)).size, results.parties.length, 'Unique parties');
  assert.equal(results.parties.reduce((sum, party) => sum + party.votes, 0), results.valid, 'Party vote total');
  return results;
}
