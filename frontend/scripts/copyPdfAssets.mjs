import { cp, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const source = path.dirname(require.resolve('pdfjs-dist/package.json'));
const target = fileURLToPath(new URL('../public/pdfjs/', import.meta.url));
await mkdir(target, { recursive: true });
for (const directory of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  await cp(path.join(source, directory), path.join(target, directory), { recursive: true });
}
await copyFile(path.join(source, 'LICENSE'), path.join(target, 'LICENSE'));
