// Run after astro build: node scripts/check-diagram.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { states } from '../src/data/states.ts';

const routes = Object.entries(states).flatMap(([slug, state]) => state.years.map((year) => `${slug}/${year}`));
for (const route of routes) {
  const data = JSON.parse(readFileSync(`public/data/${route}.json`, 'utf8'));
  const html = readFileSync(`dist/${route}/index.html`, 'utf8');
  const svg = html.match(/<svg\b[^>]*role="img"[\s\S]*?<\/svg>/)[0];
  const rects = [...svg.matchAll(/<rect\b([^>]*)>\s*<title>([\s\S]*?)<\/title>/g)];
  const node = (label) => {
    const match = rects.find((rect) => rect[2].trim().startsWith(`${label}:`));
    assert.ok(match, `${route}: missing ${label}`);
    return { height: Number(match[1].match(/height="([^"]+)"/)[1]), title: match[2].trim(), attrs: match[1] };
  };
  const percent = (votes) => `${(votes / data.secondVotes.votesPerVoter / data.population.residents * 100).toFixed(1).replace('.', ',')} %`;
  const validLabel = `${data.secondVotes.label}${data.secondVotes.votesPerVoter > 1 ? "**" : ""}`;
  const valid = node(validLabel);
  assert.ok(Math.abs(valid.height / node('Einwohner:innen').height - data.secondVotes.valid / data.secondVotes.votesPerVoter / data.population.residents) < 1e-10);
  assert.ok(!/NaN|Infinity|undefined/.test(svg), `${route}: finite geometry and colors`);
  for (const party of data.secondVotes.parties.filter((party) => party.name === 'FDP' || party.votes / data.secondVotes.valid >= 0.05)) {
    const band = node(party.name);
    assert.ok(band.title.includes(percent(party.votes)), `${route}: ${party.name} population share`);
    assert.ok(Math.abs(band.height / node('Einwohner:innen').height - party.votes / data.secondVotes.votesPerVoter / data.population.residents) < 1e-10);
    assert.match(band.attrs, /fill="#[a-f0-9]{6}"/i);
    if (party.name.toLowerCase() === 'die linke') assert.ok(band.attrs.includes('fill="#bd4598"'));
  }
  if (data.eligibility.estimatedBreakdown === null) {
    assert.ok(!rects.some((rect) => /Unter \d|Sonstige Differenz/.test(rect[2])), `${route}: no invented demographics`);
    assert.ok(html.includes(data.eligibility.note));
  }
  if (data.ballots) {
    assert.equal(valid.title, `${validLabel}: ${percent(data.secondVotes.valid)}`);
    const unused = node('Nicht ausgeschöpfte Stimmen');
    assert.ok(Math.abs(node('Gültige Stimmzettel').height - valid.height - unused.height) < 1e-10);
    assert.ok(!svg.includes('221,5 %'));
  } else if (data.secondVotes.votesPerVoter > 1) {
    assert.equal(valid.title, `${validLabel}: ${percent(data.secondVotes.valid)}`);
    const missing = node(data.secondVotes.noValidLabel);
    assert.ok(Math.abs(node('Wähler:innen').height - valid.height - missing.height) < 1e-10);
    assert.ok(html.includes(data.unitNote));
  } else {
    assert.ok(valid.title.includes(new Intl.NumberFormat('de-DE').format(data.secondVotes.valid)));
  }
}
console.log(`Diagram regression checks passed for all ${routes.length} elections.`);
