import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { states } from '../src/data/states.ts';

assert.equal(Object.keys(states).length, 16);
const home = readFileSync('dist/index.html', 'utf8');
for (const [slug, state] of Object.entries(states)) {
  assert.ok(home.includes(`href="/${slug}/"`), `${slug}: homepage link`);
  assert.match(state.latestElection, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(state.latestElection <= '2026-09-05', `${slug}: completed election`);
  const page = readFileSync(`dist/${slug}/index.html`, 'utf8');
  assert.ok(page.includes(`/${slug}/${Number(state.latestElection.slice(0, 4))}/`), `${slug}: diagram link`);
  assert.ok(page.includes(String(Number(state.latestElection.slice(0, 4)))), `${slug}: election year`);
  assert.ok(state.years.includes(Number(state.latestElection.slice(0, 4))), `${slug}: latest diagram exists`);
  for (const year of state.years) {
    const data = JSON.parse(readFileSync(`public/data/${slug}/${year}.json`, 'utf8'));
    assert.equal(data.year, year);
    assert.ok(readFileSync(`dist/${slug}/${year}/index.html`, 'utf8').includes('<svg'));
  }
}
console.log('Verified all 16 state pages, diagram links, and available diagrams.');
