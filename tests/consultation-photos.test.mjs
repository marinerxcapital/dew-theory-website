import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectMime,
  isAllowedMime,
  isAllowedSlot,
  missingRequiredSlots,
  randomObjectKey,
  ALLOWED_MIME,
  MAX_BYTES
} from '../lib/consultations/photo-storage.js';
import { PHOTO_SLOTS, REQUIRED_PHOTO_SLOTS } from '../lib/consultations/statuses.js';
import {
  isAllowedSlot as photosIsAllowedSlot,
  detectMime as photosDetectMime,
  missingRequiredSlots as photosMissingRequired
} from '../lib/consultations/photos.js';

function jpegBuffer() {
  // Minimal SOI + filler so magic bytes match JPEG
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
}

function pngBuffer() {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
}

function webpBuffer() {
  // RIFF....WEBP
  const b = Buffer.alloc(12);
  b.write('RIFF', 0, 'ascii');
  b.writeUInt32LE(4, 4);
  b.write('WEBP', 8, 'ascii');
  return b;
}

function heicBuffer() {
  const b = Buffer.alloc(12);
  b.writeUInt32BE(0, 0);
  b.write('ftyp', 4, 'ascii');
  b.write('heic', 8, 'ascii');
  return b;
}

describe('consultation photo mime detection', () => {
  it('detects jpeg/png/webp/heic', () => {
    assert.equal(detectMime(jpegBuffer()), 'image/jpeg');
    assert.equal(detectMime(pngBuffer()), 'image/png');
    assert.equal(detectMime(webpBuffer()), 'image/webp');
    assert.equal(detectMime(heicBuffer()), 'image/heic');
    assert.equal(detectMime(heicBuffer(), 'image/heif'), 'image/heif');
  });

  it('rejects empty and unknown buffers', () => {
    assert.equal(detectMime(Buffer.alloc(0)), null);
    assert.equal(detectMime(Buffer.from([0x00, 0x01, 0x02])), null);
    assert.equal(detectMime(null), null);
  });

  it('allows only configured MIME types', () => {
    assert.equal(isAllowedMime('image/jpeg'), true);
    assert.equal(isAllowedMime('image/png'), true);
    assert.equal(isAllowedMime('image/webp'), true);
    assert.equal(isAllowedMime('image/heic'), true);
    assert.equal(isAllowedMime('image/heif'), true);
    assert.equal(isAllowedMime('image/gif'), false);
    assert.equal(isAllowedMime('application/pdf'), false);
    assert.equal(isAllowedMime(null), false);
    assert.ok(ALLOWED_MIME.has('image/jpeg'));
    assert.ok(MAX_BYTES > 0);
  });

  it('re-exports detectMime from photos.js', () => {
    assert.equal(photosDetectMime(jpegBuffer()), 'image/jpeg');
  });
});

describe('consultation photo slots', () => {
  it('validates allowed slots', () => {
    assert.equal(isAllowedSlot('front', PHOTO_SLOTS), true);
    assert.equal(isAllowedSlot('chin_jawline', PHOTO_SLOTS), true);
    assert.equal(isAllowedSlot('area_of_concern', PHOTO_SLOTS), true);
    assert.equal(isAllowedSlot('not_a_slot', PHOTO_SLOTS), false);
    assert.equal(isAllowedSlot('', PHOTO_SLOTS), false);
    assert.equal(photosIsAllowedSlot('front'), true);
    assert.equal(photosIsAllowedSlot('selfie'), false);
  });

  it('reports missing required slots', () => {
    assert.deepEqual(
      missingRequiredSlots([], REQUIRED_PHOTO_SLOTS),
      REQUIRED_PHOTO_SLOTS
    );
    assert.deepEqual(
      missingRequiredSlots(['front', 'left'], REQUIRED_PHOTO_SLOTS),
      REQUIRED_PHOTO_SLOTS.filter((s) => s !== 'front' && s !== 'left')
    );
    assert.deepEqual(
      missingRequiredSlots(
        [...REQUIRED_PHOTO_SLOTS, 'area_of_concern'],
        REQUIRED_PHOTO_SLOTS
      ),
      []
    );
    // area_of_concern is optional — not in required list
    assert.equal(REQUIRED_PHOTO_SLOTS.includes('area_of_concern'), false);
    assert.deepEqual(
      photosMissingRequired(['front'], REQUIRED_PHOTO_SLOTS),
      missingRequiredSlots(['front'], REQUIRED_PHOTO_SLOTS)
    );
  });

  it('builds opaque object keys from slot', () => {
    const a = randomObjectKey('front');
    const b = randomObjectKey('front');
    assert.match(a, /^front\/[a-f0-9]{32}$/);
    assert.notEqual(a, b);
    assert.match(randomObjectKey('chin_jawline'), /^chin_jawline\//);
    // sanitizes unsafe slot chars
    assert.match(randomObjectKey('../evil slot!'), /^evilslot\//);
  });
});
