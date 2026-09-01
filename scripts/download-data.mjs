import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const rawDirectory = 'data/raw/2023';
const sources = {
  'structure.pdf':
    'https://download.statistik-berlin-brandenburg.de/b92c90f8fa8b534e/45210729b5a5/SB_B07-02-01_2023j05_BE.pdf',
  'population.pdf':
    'https://download.statistik-berlin-brandenburg.de/e501bddfe3150920/e07c5833fe8e/SB_A01-05-00_2022h02_BE.pdf',
  'results.pdf':
    'https://download.statistik-berlin-brandenburg.de/538210b8454f4642/99e340a74910/SB_B07-02-03_2023j05_BE.pdf',
};

await mkdir(rawDirectory, { recursive: true });
const manifest = { retrievedAt: new Date().toISOString(), sources: [] };

for (const [name, url] of Object.entries(sources)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
    throw new Error(`${url}: expected a PDF`);
  }

  const file = `${rawDirectory}/${name}`;
  await writeFile(file, bytes);
  manifest.sources.push({
    id: name.slice(0, -4),
    url,
    file,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
  console.log(`Downloaded ${name}`);
}

await writeFile(`${rawDirectory}/sources.json`, `${JSON.stringify(manifest, null, 2)}\n`);
