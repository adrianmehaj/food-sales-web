import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'dist');
const assets = (await readdir(path.join(root, 'assets'))).sort().map((file) => '/assets/' + file);
const index = await readFile(path.join(root, 'index.html'), 'utf8');
const hash = createHash('sha256').update(index).digest('hex').slice(0, 12);
const worker = (await readFile(path.join(root, 'sw.js'), 'utf8'))
  .replace("'tryeza-shell-v1'", JSON.stringify('tryeza-shell-' + hash))
  .replace(
    'const SHELL = [',
    'const SHELL = [' + assets.map((x) => JSON.stringify(x)).join(',') + ','
  );
await writeFile(path.join(root, 'sw.js'), worker);
console.log(`PWA shell ${hash}: ${assets.length} assets included. API responses are never cached.`);
