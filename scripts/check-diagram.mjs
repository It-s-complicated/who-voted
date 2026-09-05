// Run after astro build: node scripts/check-diagram.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const route of ['hamburg/2025', 'bremen/2023', 'berlin/2023']) {
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
  const validLabel = `${data.secondVotes.label}${data.ballots ? "**" : ""}`;
  const valid = node(validLabel);
  assert.ok(Math.abs(valid.height / node('Einwohner:innen').height - data.secondVotes.valid / data.secondVotes.votesPerVoter / data.population.residents) < 1e-10);
  for (const label of ['SPD', route.startsWith('hamburg') ? 'Die Linke' : 'DIE LINKE']) {
    const party = data.secondVotes.parties.find((party) => party.name === label);
    assert.ok(node(label).title.includes(percent(party.votes)));
  }
  assert.ok(node(route.startsWith('hamburg') ? 'Die Linke' : 'DIE LINKE').attrs.includes('fill="#bd4598"'));
  assert.match(svg, /<path[^>]*stroke="#bd4598"[^>]*>/);
  if (data.ballots) {
    assert.equal(valid.title, `${validLabel}: ${percent(data.secondVotes.valid)}`);
    const unused = node('Nicht ausgeschöpfte Stimmen');
    assert.ok(Math.abs(node('Gültige Stimmzettel').height - valid.height - unused.height) < 1e-10);
    assert.ok(!svg.includes('221,5 %'));
  } else {
    assert.ok(valid.title.includes(new Intl.NumberFormat('de-DE').format(data.secondVotes.valid)));
  }
}
console.log('Diagram regression checks passed for Hamburg, Bremen and Berlin.');
