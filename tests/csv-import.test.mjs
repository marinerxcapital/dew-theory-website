/**
 * G5 — CSV import parser + dry-run plan
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  parseCsv,
  guessMap,
  buildImportPreview,
  planImport
} from '../lib/csv-import.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('parseCsv', () => {
  it('handles quoted commas', () => {
    const { headers, rows } = parseCsv('name,description\n"A, B",nice\n');
    assert.deepEqual(headers, ['name', 'description']);
    assert.equal(rows[0].name, 'A, B');
  });
});

describe('sample-import.csv end-to-end parse', () => {
  it('parses sample file into 2 valid products', () => {
    const text = readFileSync(join(root, 'data/sample-import.csv'), 'utf8');
    const { headers, rows } = parseCsv(text);
    const map = guessMap(headers);
    const { products, bad } = buildImportPreview(rows, map);
    assert.equal(bad.length, 0);
    assert.equal(products.length, 2);
    assert.equal(products[0].retail_price, 20);
    assert.equal(products[1].retail_price, 28);
    assert.ok(products[0].key_actives.length >= 1);
  });
});

describe('buildImportPreview bad rows', () => {
  it('reports missing name and bad wholesale', () => {
    const map = { name: 'name', wholesale_price: 'wholesale_price' };
    const { products, bad } = buildImportPreview(
      [
        { name: '', wholesale_price: '10' },
        { name: 'Ok', wholesale_price: 'x' },
        { name: 'Good', wholesale_price: '12' }
      ],
      map
    );
    assert.equal(products.length, 1);
    assert.equal(bad.length, 2);
  });
});

describe('planImport', () => {
  it('counts create vs update', () => {
    const plan = planImport([{ id: 'a' }, { id: 'b' }], ['a']);
    assert.equal(plan.wouldCreate, 1);
    assert.equal(plan.wouldUpdate, 1);
  });
});
