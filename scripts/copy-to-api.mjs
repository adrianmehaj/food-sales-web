import { cp, mkdir, access, readFile } from 'node:fs/promises';
import path from 'node:path';

const web = path.resolve(import.meta.dirname, '..');
const api = path.resolve(
  process.argv[2] ?? process.env.FOODSALES_API_PATH ?? path.join(web, '..', 'food-sales-api')
);
await access(path.join(api, 'src/FoodSales.Api/FoodSales.Api.csproj'));
await access(path.join(web, 'dist/index.html'));
const manifest = JSON.parse(await readFile(path.join(web, 'dist/manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons) await access(path.join(web, 'dist', icon.src));
const target = path.join(api, 'src/FoodSales.Api/wwwroot');
await mkdir(target, { recursive: true });
await cp(path.join(web, 'dist'), target, { recursive: true });
console.log(
  `React + PWA copied to ${target}. Publish FoodSales.Api to host the complete application.`
);
