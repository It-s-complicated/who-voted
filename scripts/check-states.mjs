import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { states } from '../src/data/states.ts';

assert.equal(Object.keys(states).length, 16);
const home = readFileSync('dist/index.html', 'utf8');
const timeline = home.split('aria-label="Wahlen im Zeitverlauf"')[1].split('<nav')[0];
const timelineDates = [...timeline.matchAll(/datetime="([^"]+)"/g)].map((match) => match[1]);
const expectedDates = Object.values(states).flatMap((state) =>
  Object.values(state.elections).map((election) => election.electionDate),
).sort().reverse();
assert.deepEqual(timelineDates, [...new Set(expectedDates)], 'timeline has one entry per date, newest first');
const dateGroups = [...timeline.matchAll(/<li class="election-date"[^>]*>(.*?)<\/li>/gs)].map((match) => match[1]);
assert.equal(dateGroups.length, new Set(expectedDates).size, 'one tick group per election date');
for (let year = Number(expectedDates.at(-1).slice(0, 4)); year <= Number(expectedDates[0].slice(0, 4)); year++) {
  assert.ok(timeline.includes(`id="year-${year}"`), `${year}: timeline year mark`);
}
for (const [slug, state] of Object.entries(states)) {
  assert.ok(home.includes(`href="/${slug}/"`), `${slug}: homepage link`);
  assert.match(state.latestElection, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(state.latestElection <= '2026-09-12', `${slug}: completed election`);
  const page = readFileSync(`dist/${slug}/index.html`, 'utf8');
  assert.ok(page.includes(`/${slug}/${Number(state.latestElection.slice(0, 4))}/`), `${slug}: diagram link`);
  assert.ok(page.includes(String(Number(state.latestElection.slice(0, 4)))), `${slug}: election year`);
  assert.ok(state.years.includes(Number(state.latestElection.slice(0, 4))), `${slug}: latest diagram exists`);
  for (const year of state.years) {
    assert.ok(timeline.includes(`href="/${slug}/${year}/"`), `${slug}/${year}: timeline election link`);
    const dateGroup = dateGroups.find((group) => group.includes(`datetime="${state.elections[year].electionDate}"`));
    assert.ok(dateGroup?.includes(`href="/${slug}/${year}/"`), `${slug}/${year}: link belongs to its shared date group`);
    const data = JSON.parse(readFileSync(`public/data/${slug}/${year}.json`, 'utf8'));
    assert.equal(data.year, year);
    const diagram = readFileSync(`dist/${slug}/${year}/index.html`, 'utf8');
    assert.ok(diagram.includes('<svg'));
    const resultLabel = data.resultStatus === 'preliminary' ? 'vorläufiges' : 'endgültiges';
    assert.ok(diagram.includes(`: ${resultLabel} Wahlergebnis</a>`), `${slug}/${year}: source result status`);
  }
}
console.log('Verified all 16 state pages, diagram links, and available diagrams.');
