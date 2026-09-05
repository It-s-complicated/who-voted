import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const sources = {
  'berlin/2023': {
    'structure.pdf':
      'https://download.statistik-berlin-brandenburg.de/b92c90f8fa8b534e/45210729b5a5/SB_B07-02-01_2023j05_BE.pdf',
    'population.pdf':
      'https://download.statistik-berlin-brandenburg.de/e501bddfe3150920/e07c5833fe8e/SB_A01-05-00_2022h02_BE.pdf',
    'results.pdf':
      'https://download.statistik-berlin-brandenburg.de/538210b8454f4642/99e340a74910/SB_B07-02-03_2023j05_BE.pdf',
  },
  'hamburg/2025': {
    'results.pdf':
      'https://www.statistik-nord.de/fileadmin/Dokumente/BUE2025_e_05.pdf',
    'population.xlsx':
      'https://www.statistik-nord.de/fileadmin/Dokumente/A_I_3_j24_HH_Zensus_2022.xlsx',
    'register.xlsx':
      'https://www.statistik-nord.de/fileadmin/Dokumente/A_I_S_1_j24.xlsx',
    'foreign.xlsx':
      'https://www.statistik-nord.de/fileadmin/Dokumente/A_I_4_j_24_HH.xlsx',
  },
  'bremen/2023': {
    'results.pdf':
      'https://www.statistik.bremen.de/sixcms/media.php/13/Statistische%20Mitteilungen_126_pdfa_Auflage2.pdf',
    'population.csv':
      'https://www.transparenz.bremen.de/sixcms/media.php/13/genesis-destatis-12411-0014.csv',
  },
};

const requested = process.argv.slice(2);
for (const [directory, files] of Object.entries(sources)) {
  if (requested.length && !requested.includes(directory)) continue;

  const rawDirectory = `data/raw/${directory}`;
  await mkdir(rawDirectory, { recursive: true });
  const manifest = { retrievedAt: new Date().toISOString(), sources: [] };

  for (const [name, url] of Object.entries(files)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const head = new TextDecoder().decode(bytes.subarray(0, 20));
    if (name.endsWith('.csv') ? !head.replace('\uFEFF', '').startsWith('Tabelle:') : !head.startsWith('%PDF-') && !head.startsWith('PK')) {
      throw new Error(`${url}: unexpected file type`);
    }

    const file = `${rawDirectory}/${name}`;
    await writeFile(file, bytes);
    manifest.sources.push({
      id: name.replace(/\.\w+$/, ''),
      url,
      file,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
    console.log(`Downloaded ${directory}/${name}`);
  }

  await writeFile(`${rawDirectory}/sources.json`, `${JSON.stringify(manifest, null, 2)}\n`);
}
