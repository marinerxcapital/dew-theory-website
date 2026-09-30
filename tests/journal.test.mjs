import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JOURNAL_ENTRIES, getJournalEntry, getJournalTopics } from '../lib/journal.js';

describe('journal content', () => {
  it('has at least one entry', () => {
    assert.ok(JOURNAL_ENTRIES.length > 0);
  });

  it('every entry has the required shape', () => {
    for (const e of JOURNAL_ENTRIES) {
      assert.equal(typeof e.slug, 'string');
      assert.ok(e.slug.length > 0);
      assert.equal(typeof e.title, 'string');
      assert.equal(typeof e.dek, 'string');
      assert.equal(typeof e.topic, 'string');
      assert.equal(typeof e.edition, 'string');
      assert.ok(Array.isArray(e.body) && e.body.length > 0, `${e.slug} has no body`);
      for (const block of e.body) {
        const kinds = ['p', 'h', 'list'].filter((k) => k in block);
        assert.equal(kinds.length, 1, `${e.slug} has a malformed body block`);
      }
    }
  });

  it('slugs are unique and resolvable', () => {
    const seen = new Set();
    for (const e of JOURNAL_ENTRIES) {
      assert.ok(!seen.has(e.slug), `duplicate slug: ${e.slug}`);
      seen.add(e.slug);
      assert.ok(getJournalEntry(e.slug));
    }
    assert.equal(getJournalEntry('does-not-exist'), null);
  });

  it('asserts no publish dates', () => {
    for (const e of JOURNAL_ENTRIES) {
      assert.ok(!('date' in e), `${e.slug} must not carry a fabricated date`);
      assert.ok(!('published' in e), `${e.slug} must not carry a fabricated publish flag`);
    }
  });

  it('topics are non-empty strings', () => {
    const topics = getJournalTopics();
    assert.ok(topics.length > 0);
    for (const t of topics) assert.ok(typeof t === 'string' && t.length > 0);
  });
});
