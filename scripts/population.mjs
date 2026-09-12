import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const exports = new Map();

// Fixed official flat CSV exports; all selected labels are free of semicolons.
export function populationSnapshot(source, land, votingAge) {
  const census = source.file.includes('1000A-2012');
  const table = census ? '1000A-2012' : '12411-0014';
  if (!exports.has(source.file)) {
    const csv = execFileSync('unzip', ['-p', source.file, `${table}_de_flat.csv`], {
      maxBuffer: 256 * 1024 * 1024,
    }).toString('utf8');
    exports.set(source.file, csv.split('\n').map((line) => line.split(';')));
  }
  return parsePopulationRows(exports.get(source.file), source.referenceDate, land, votingAge, census);
}

export function parsePopulationRows(rows, referenceDate, land, votingAge, census = false) {
  const values = new Map();
  for (const cells of rows) {
    if (cells[4] !== referenceDate || cells[8] !== land) continue;
    if (census ? cells[5] !== 'GEOBL1' : cells[16] !== 'Insgesamt') continue;
    const key = census ? `${cells[15]}|${cells[11]}` : `${cells[11]}|${cells[19]}`;
    assert.ok(!values.has(key), `${land}: duplicate demographic cell ${key}`);
    values.set(key, cells[census ? 17 : 21]);
  }
  function cell(nationality, age = '') {
    const raw = values.get(`${nationality}|${age}`);
    assert.ok(typeof raw === 'string' && /^\d+$/.test(raw), `${land} ${referenceDate}: missing or invalid ${nationality}|${age}`);
    const value = Number(raw);
    assert.ok(Number.isSafeInteger(value), `${land}: unsafe population count`);
    return value;
  }
  const foreignCode = census ? 'AUSLAND' : 'NATA';
  let underVotingAge = 0;
  let foreignUnderAge = 0;
  for (let age = 0; age < votingAge; age += 1) {
    const code = census ? (age === 0 ? 'ALTERU01' : `ALTER${String(age).padStart(3, '0')}`) : `ALT${String(age).padStart(3, '0')}`;
    const total = cell('', code);
    const foreign = cell(foreignCode, code);
    assert.ok(foreign <= total, `${land}: foreign age group exceeds total`);
    underVotingAge += total;
    foreignUnderAge += foreign;
  }
  const residents = cell('');
  const foreignTotal = cell(foreignCode);
  assert.ok(foreignUnderAge <= foreignTotal && foreignTotal <= residents, `${land}: foreign population bounds`);
  return { residents, underVotingAge, nonGermanVotingAgeOrOlder: foreignTotal - foreignUnderAge };
}
