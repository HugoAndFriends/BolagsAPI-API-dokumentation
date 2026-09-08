import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const sources = {
  'openapi.json': 'https://api.bolagsapi.se/openapi.json',
  'identity-enrichment.schema.json': 'https://api.bolagsapi.se/identity/enrichment.schema.json',
};
await mkdir('schemas', { recursive: true });
const manifest = { syncedAt: new Date().toISOString(), sources: {} };
for (const [file, url] of Object.entries(sources)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const data = await response.json();
  if (file === 'openapi.json' ? !data.paths || !data.components : !data.$defs) throw new Error(`Invalid schema: ${url}`);
  const content = JSON.stringify(data, null, 2) + '\n';
  await writeFile(`schemas/${file}`, content);
  manifest.sources[file] = { url, sha256: createHash('sha256').update(content).digest('hex') };
}
await writeFile('schemas/sources.json', JSON.stringify(manifest, null, 2) + '\n');
await import('./generate.mjs');
