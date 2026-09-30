/**
 * One-off mechanical rewrite: remove the superseded CLINICAL NOIR override
 * block from app/globals.css and append the authored PEARL EDITORIAL layer in
 * its place, then remove the transient source file.
 *
 * Deterministic and verifiable: it only truncates at the noir block's own
 * opening comment and appends a file that was authored separately.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const globalsPath = path.join(root, 'app', 'globals.css');
const layerPath = path.join(root, 'pearl-layer.css');

const lines = fs.readFileSync(globalsPath, 'utf8').split(/\r?\n/);
const marker = lines.findIndex(
  (l) => l.includes('CLINICAL NOIR') && l.includes('authoritative token layer')
);
if (marker < 0) {
  console.error('FAIL: noir override marker not found in app/globals.css');
  process.exit(1);
}

let start = marker;
while (start > 0 && !lines[start].startsWith('/* =')) start -= 1;

const kept = lines.slice(0, start);
while (kept.length && kept[kept.length - 1].trim() === '') kept.pop();

const pearl = fs.readFileSync(layerPath, 'utf8').replace(/\s+$/, '');
const out = `${kept.join('\n')}\n\n${pearl}\n`;
fs.writeFileSync(globalsPath, out);
fs.unlinkSync(layerPath);

console.log(`removed noir block starting at original line ${start + 1}`);
console.log(`app/globals.css is now ${out.split('\n').length} lines`);
