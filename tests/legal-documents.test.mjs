import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  CONSUMER_HEALTH_POLICY_PUBLISHED,
  LEGAL_DOCUMENTS,
  MINOR_CLIENT_BOOKING_ENABLED,
  MISSING_FROM_ARCHIVE,
  getBookingLegalDocuments,
  getCheckoutLegalDocuments,
  getFooterLegalLinks,
  getInternalDocumentFileNames,
  getMembershipLegalDocuments,
  getPublicLegalRoutes,
  getPublicPdfPaths,
  getVirtualConsultationLegalDocuments
} from '../lib/legal-documents.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicPdfDir = join(root, 'public/legal/pdfs');
const internalDir = join(root, 'legal/internal');

describe('legal documents registry', () => {
  it('exposes public legal routes without duplicates', () => {
    const routes = getPublicLegalRoutes();
    assert.deepEqual(
      [...routes].sort(),
      [
        '/accessibility',
        '/aesthetic-disclaimer',
        '/booking-policy',
        '/cookies',
        '/privacy',
        '/returns',
        '/shipping',
        '/terms'
      ]
    );
  });

  it('footer links are public HTML routes only', () => {
    const links = getFooterLegalLinks();
    const hrefs = links.map((l) => l.href);
    assert.ok(hrefs.includes('/terms'));
    assert.ok(hrefs.includes('/privacy'));
    assert.ok(hrefs.includes('/shipping'));
    assert.ok(hrefs.includes('/returns'));
    assert.ok(hrefs.includes('/booking-policy'));
    assert.ok(hrefs.includes('/aesthetic-disclaimer'));
    assert.ok(hrefs.includes('/accessibility'));
    assert.ok(hrefs.includes('/cookies'));
    assert.equal(CONSUMER_HEALTH_POLICY_PUBLISHED, false);
    assert.ok(!hrefs.includes('/consumer-health'));
    for (const name of getInternalDocumentFileNames()) {
      assert.ok(!JSON.stringify(links).includes(name));
    }
  });

  it('keeps internal attorney docs out of public pdf paths and footer', () => {
    const publicPaths = getPublicPdfPaths().join('\n');
    for (const name of getInternalDocumentFileNames()) {
      assert.ok(!publicPaths.includes(name), name);
      assert.ok(existsSync(join(internalDir, name)), `missing internal ${name}`);
      assert.ok(!existsSync(join(publicPdfDir, name)), `internal must not be public: ${name}`);
    }
  });

  it('serves FIXED V2 public PDFs with PDF headers', () => {
    for (const doc of LEGAL_DOCUMENTS) {
      if (!doc.pdfPath) continue;
      const abs = join(root, 'public', doc.pdfPath.replace(/^\//, ''));
      assert.ok(existsSync(abs), doc.fileName);
      const magic = readFileSync(abs).subarray(0, 5).toString('utf8');
      assert.equal(magic, '%PDF-', doc.fileName);
    }
  });

  it('checkout links cover terms, privacy, shipping, returns', () => {
    const ids = getCheckoutLegalDocuments().map((d) => d.id).sort();
    assert.deepEqual(ids, ['privacy', 'returns', 'shipping', 'terms']);
  });

  it('virtual consultation docs include required set and gate consumer health', () => {
    const ids = getVirtualConsultationLegalDocuments().map((d) => d.id);
    assert.ok(ids.includes('virtual-consultation-terms'));
    assert.ok(ids.includes('consultation-photo-intake'));
    assert.ok(ids.includes('privacy'));
    assert.ok(!ids.includes('consumer-health'));
    assert.equal(CONSUMER_HEALTH_POLICY_PUBLISHED, false);
  });

  it('booking docs exclude minor consent while disabled', () => {
    assert.equal(MINOR_CLIENT_BOOKING_ENABLED, false);
    const ids = getBookingLegalDocuments().map((d) => d.id);
    assert.ok(ids.includes('booking-policy'));
    assert.ok(ids.includes('aesthetic-disclaimer'));
    assert.ok(ids.includes('treatment-informed-consent'));
    assert.ok(!ids.includes('minor-guardian-consent'));
  });

  it('membership docs are pre-launch and not in footer', () => {
    const mem = getMembershipLegalDocuments();
    assert.equal(mem.length, 1);
    assert.equal(mem[0].visibility, 'PRE_LAUNCH');
    assert.ok(!getFooterLegalLinks().some((l) => l.href.includes('membership')));
  });

  it('records missing complete package from archive', () => {
    assert.ok(MISSING_FROM_ARCHIVE.includes('DEW_THEORY_COMPLETE_LEGAL_POLICY_PACKAGE.pdf'));
  });

  it('has no stale cropped-logo public pdf filenames in public/legal/pdfs', () => {
    const files = readdirSync(publicPdfDir).filter((f) => f.endsWith('.pdf'));
    // Canonical FIXED V2 names only — no hash suffixes, no alternate generations
    for (const f of files) {
      assert.ok(f.startsWith('DEW_THEORY_'), f);
      assert.ok(!/_[0-9a-f]{4}\.pdf$/i.test(f), `hash suffix stale name: ${f}`);
    }
    assert.equal(files.length, 14);
  });
});
