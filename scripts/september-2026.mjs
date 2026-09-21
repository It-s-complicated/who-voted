import assert from 'node:assert/strict';

// ponytail: these retained semicolon exports have no quoted data fields;
// reject quoting and use a CSV library if a future export needs it.
export function septemberResults(route, text, description = '') {
  const berlin = route === 'berlin/2026';
  assert.ok(berlin || route === 'mecklenburg-vorpommern/2026');
  const lines = text.trim().split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(berlin ? 'Adresse;' : 'Berechnungsdatum;'));
  assert.ok(start >= 0, 'Missing result headers');
  const headers = lines[start].split(';');
  assert.equal(new Set(headers).size, headers.length, 'Unique result headers');
  const rows = lines.slice(start + 1).map((line) => {
    assert.ok(!line.includes('"'), 'Unsupported quoted result field');
    const cells = line.split(';');
    assert.equal(cells.length, headers.length, 'Result column count');
    return Object.fromEntries(headers.map((key, index) => [key, cells[index]]));
  });
  const statewide = rows.filter((row) => berlin
    ? row.Adresse === 'GI9900' && row.StimmArt === '2'
    : row.Wahlkreis === '99' && row.Ausgabe === 'A' && row['Erst-/Zweitstimme'] === '2');
  assert.equal(statewide.length, 1, 'Unique statewide second-vote result');
  const [row] = statewide;
  const count = (key) => {
    assert.match(row[key] ?? '', /^\d+$/, `Invalid ${key}`);
    const value = Number(row[key]);
    assert.ok(Number.isSafeInteger(value), `Unsafe ${key}`);
    return value;
  };
  assert.equal(row[berlin ? 'Gebietsname' : 'Wahlkreisname/Land'], berlin ? 'Berlin' : 'Mecklenburg-Vorpommern');
  // Berlin's Datum is YY.MM.DD, per the retained data dictionary.
  assert.match(row[berlin ? 'Datum' : 'Berechnungsdatum'], berlin ? /^26\.09\.21$/ : /^21\.09\.2026 /);
  assert.equal(count(berlin ? 'AnzWbez' : 'Wahlbezirke insg.'), berlin ? 4114 : 1974);
  assert.equal(count(berlin ? 'AusWbez' : 'Erf. Wahlbezirke'), berlin ? 4114 : 1974, 'Complete count');
  const names = Object.fromEntries(description.trim().split(/\r?\n/).map((line) => line.split(';')));
  const shortNames = { P01: 'CDU', P02: 'SPD', P03: 'GRÜNE', P04: 'Die Linke', P05: 'AfD', P06: 'FDP', P07: 'Tierschutzpartei', P08: 'Die PARTEI', P09: 'Volt', P12: 'Die Urbane.', P13: 'DKP', P14: 'ÖDP', P15: 'Die Heimat', P16: 'Bergpartei', P17: 'SGP', P24: 'BSW', P27: 'PdF' };
  const partyColumns = berlin ? headers.filter((key) => /^P\d+$/.test(key)) : headers.slice(12);
  const parties = partyColumns.flatMap((key) => {
    if (!berlin && row[key] === 'x') {
      assert.ok(['LfK', 'Einzelbewerber'].includes(key), 'Only direct candidates have no second votes');
      return [];
    }
    const votes = count(key);
    if (berlin && names[key]?.startsWith('nicht besetzt')) {
      assert.equal(votes, 0, 'Unoccupied party code');
      return [];
    }
    if (berlin) assert.ok(names[key], `Missing party definition ${key}`);
    return [{ name: berlin ? shortNames[key] ?? names[key] : key, votes }];
  });
  const eligible = count(berlin ? 'WberIns' : 'Wahlberechtigte');
  const voters = count(berlin ? 'Waehler' : 'Wähler');
  const invalid = count(berlin ? 'Unguelt' : 'Ungültige Stimmen');
  const valid = count(berlin ? 'Gueltig' : 'Gültige Stimmen');
  assert.equal(parties.reduce((sum, party) => sum + party.votes, 0), valid, 'Party vote total');
  assert.equal(valid + invalid, voters, 'Second-vote total');
  return { eligible, voters, invalid, valid, parties };
}
