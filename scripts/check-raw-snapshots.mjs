import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'who-voted-snapshots-'));
const manifestPath = (route) => join(temporary, `data/raw/${route}/sources.json`);
const manifest = async (route) => JSON.parse(await readFile(manifestPath(route), 'utf8'));
const population = (manifest) => manifest.sources.find((source) => source.id === 'population');
try {
  await cp(new URL('data/raw', root), join(temporary, 'data/raw'), { recursive: true });
  function download(routes, changed = false) {
    execFileSync(process.execPath, ['--input-type=module', '-e', `
      import { readFile } from 'node:fs/promises';
      import { stateSources } from ${JSON.stringify(new URL('scripts/state-sources.mjs', root).href)};
      const sources = Object.values(stateSources).flatMap(Object.values);
      globalThis.fetch = async (url) => {
        const source = sources.find((source) => source.url === url);
        const bytes = await readFile(new URL(source.file, ${JSON.stringify(root.href)}));
        return new Response(${changed} && source.file.includes('/population/') ? Buffer.concat([bytes, Buffer.from('changed')]) : bytes);
      };
      process.argv = ['node', 'download-data.mjs', ...${JSON.stringify(routes)}];
      await import(${JSON.stringify(new URL('scripts/download-data.mjs', root).href)});
    `], { cwd: temporary, stdio: 'pipe' });
  }
  download(['bayern/2023', 'hessen/2023']);
  const oldBavaria = await manifest('bayern/2023');
  const oldHesse = await manifest('hessen/2023');
  const oldPopulation = population(oldBavaria);
  assert.equal(oldPopulation.file, population(oldHesse).file, 'identical downloads share a snapshot');
  const oldBytes = await readFile(join(temporary, oldPopulation.file));
  download(['bayern/2023'], true);
  assert.notEqual(population(await manifest('bayern/2023')).file, oldPopulation.file);
  assert.deepEqual(await manifest('hessen/2023'), oldHesse, 'another election manifest stays unchanged');
  assert.deepEqual(await readFile(join(temporary, oldPopulation.file)), oldBytes, 'old snapshot stays unchanged');
  assert.deepEqual(await readFile(join(temporary, 'data/raw/population/genesis-12411-0014-flat.zip')), oldBytes, 'legacy shared file stays unchanged');

  // Build valid snapshots with legacy paths removed, proving the parser uses manifests.
  await writeFile(manifestPath('bayern/2023'), JSON.stringify(oldBavaria));
  const files = await readdir(join(temporary, 'data/raw'), { recursive: true });
  for (const file of files.filter((file) => file.endsWith('/sources.json'))) {
    const path = join(temporary, 'data/raw', file);
    const data = JSON.parse(await readFile(path, 'utf8'));
    for (const source of data.sources.filter((source) => source.file.startsWith('data/raw/population/'))) {
      const snapshot = source.file.replace(/\.zip$/, '-test.zip');
      await cp(join(temporary, source.file), join(temporary, snapshot));
      source.file = snapshot;
    }
    await writeFile(path, JSON.stringify(data));
  }
  for (const name of ['genesis-12411-0014-flat.zip', 'zensus-1000A-2012-flat.zip']) {
    await rm(join(temporary, 'data/raw/population', name));
  }
  execFileSync(process.execPath, [new URL('scripts/process-data.mjs', root).pathname], { cwd: temporary, stdio: 'pipe' });
  execFileSync(process.execPath, [new URL('scripts/check-data.mjs', root).pathname], { cwd: temporary, stdio: 'pipe' });
  console.log('Shared snapshots survive refreshes and rebuild from manifest paths.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
