import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'dist');
const manifest = JSON.parse(await readFile(path.join(root, '.vite', 'manifest.json'), 'utf8'));
const assets = new Set();
const visited = new Set();
function include(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const chunk = manifest[key];
  if (!chunk) throw new Error(`Missing build manifest entry: ${key}`);
  assets.add('/' + chunk.file);
  for (const file of [...(chunk.css ?? []), ...(chunk.assets ?? [])]) assets.add('/' + file);
  // Dynamic routes and export libraries are cached only after they are requested.
  for (const dependency of chunk.imports ?? []) include(dependency);
}
for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) include(key);
const index = await readFile(path.join(root, 'index.html'), 'utf8');
const hash = createHash('sha256')
  .update(index)
  .update([...assets].sort().join('\n'))
  .digest('hex')
  .slice(0, 12);
const worker = (await readFile(path.join(root, 'sw.js'), 'utf8'))
  .replace("'tryeza-shell-v1'", JSON.stringify('tryeza-shell-' + hash))
  .replace(
    'const SHELL = [',
    'const SHELL = [' +
      [...assets]
        .sort()
        .map((file) => JSON.stringify(file))
        .join(',') +
      ','
  );
await writeFile(path.join(root, 'sw.js'), worker);
console.log(
  `PWA shell ${hash}: ${assets.size} initial assets. Dynamic routes load on demand; API responses are never cached.`
);
