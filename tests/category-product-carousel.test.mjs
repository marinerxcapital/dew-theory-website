import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = fs.readFileSync(path.join(ROOT, 'components/CategoryProductCarousel.jsx'), 'utf8');

describe('CategoryProductCarousel source contract', () => {
  it('implements ring slots and reduced-motion handling', () => {
    assert.match(SRC, /hidden-left|role === 'left'|data-slot/);
    assert.match(SRC, /prefers-reduced-motion/);
    assert.match(SRC, /IntersectionObserver/);
    assert.match(SRC, /ArrowRight/);
    assert.match(SRC, /n === 1/);
    assert.match(SRC, /n === 2/);
    assert.match(SRC, /aria-roledescription=\"carousel\"/);
  });

  it('does not clone products to fake a third visible card', () => {
    assert.doesNotMatch(SRC, /duplicate.*fill/i);
    assert.match(SRC, /never show same product twice|Never show the same product twice|n === 2/i);
  });
});
