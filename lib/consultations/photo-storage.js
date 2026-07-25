/**
 * Private consultation photo blob backends.
 *
 * Preference order:
 *   1. Cloudflare R2 binding CONSULTATION_PHOTOS_R2 (durable on Workers)
 *   2. Local filesystem under data/runtime/consultation-photos (dev / Node)
 *   3. In-process memory Map (Workers without R2 / read-only FS)
 *
 * Access is private only — no public object URLs are minted.
 * Missing R2 binding or bucket must never crash; callers fall through.
 */
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

/** Wrangler R2 binding name (see wrangler.jsonc). */
export const CONSULTATION_PHOTOS_R2_BINDING = 'CONSULTATION_PHOTOS_R2';

/** R2 bucket name (create with wrangler; optional until provisioned). */
export const CONSULTATION_PHOTOS_BUCKET = 'dew-theory-consultation-photos';

export const DATA_DIR = path.join(
  process.cwd(),
  'data',
  'runtime',
  'consultation-photos'
);

export const MAX_BYTES = Number(
  process.env.CONSULTATION_PHOTO_MAX_BYTES || 10 * 1024 * 1024
);

export const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]);

/** @type {Map<string, Buffer>} */
const memoryFiles = new Map();

/** @type {boolean | null} */
let fsWritable = null;

// ── Pure helpers (unit-testable without R2 / FS) ───────────────────────────

/**
 * Magic-byte MIME detection. Returns null when unrecognized.
 * @param {Buffer} buf
 * @param {string} [claimed]
 * @returns {string | null}
 */
export function detectMime(buf, claimed) {
  if (!buf || !Buffer.isBuffer(buf) || buf.length === 0) return null;
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  // HEIC/HEIF — ftyp box
  if (buf.length >= 12 && buf.toString('ascii', 4, 8) === 'ftyp') {
    return claimed === 'image/heif' ? 'image/heif' : 'image/heic';
  }
  return null;
}

/**
 * @param {string | null | undefined} mime
 */
export function isAllowedMime(mime) {
  return Boolean(mime && ALLOWED_MIME.has(mime));
}

/**
 * @param {string} slot
 * @param {string[]} allowedSlots
 */
export function isAllowedSlot(slot, allowedSlots) {
  return Array.isArray(allowedSlots) && allowedSlots.includes(slot);
}

/**
 * Pure: which required slots are absent from the given present list.
 * @param {string[]} presentSlots
 * @param {string[]} requiredSlots
 * @returns {string[]}
 */
export function missingRequiredSlots(presentSlots, requiredSlots) {
  const present = new Set(presentSlots || []);
  return (requiredSlots || []).filter((s) => !present.has(s));
}

/**
 * Random opaque object key (no PII). Safe for FS path + R2 key.
 * @param {string} slot
 */
export function randomObjectKey(slot) {
  const id = randomBytes(16).toString('hex');
  const safeSlot = String(slot).replace(/[^a-z0-9_]/gi, '').slice(0, 40);
  return `${safeSlot}/${id}`;
}

// ── Backend resolution ─────────────────────────────────────────────────────

function ensureFsDir() {
  if (fsWritable === false) return false;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fsWritable = true;
    return true;
  } catch {
    fsWritable = false;
    return false;
  }
}

/**
 * Resolve R2 bucket from OpenNext / Workers context without throwing.
 * Returns null when off-Workers, binding missing, or context unavailable.
 * Uses the same getCloudflareContext().env[BINDING] pattern as OpenNext R2 cache.
 * Sync context only — never probes Wrangler (avoids slow/noisy off-Workers paths).
 * @returns {Promise<R2Bucket | null>}
 */
export async function getConsultationPhotosR2() {
  try {
    // Fast path: global set by worker entry / initOpenNextCloudflareForDev
    const fromGlobal = globalThis[Symbol.for('__cloudflare-context__')]?.env?.[
      CONSULTATION_PHOTOS_R2_BINDING
    ];
    if (fromGlobal && typeof fromGlobal.put === 'function') {
      return fromGlobal;
    }

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    let ctx;
    try {
      ctx = getCloudflareContext();
    } catch {
      return null;
    }
    const bucket = ctx?.env?.[CONSULTATION_PHOTOS_R2_BINDING];
    if (bucket && typeof bucket.put === 'function' && typeof bucket.get === 'function') {
      return bucket;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Which backend will be used for a new write (best-effort probe).
 * @returns {Promise<'r2' | 'fs' | 'memory'>}
 */
export async function resolveWriteBackend() {
  const r2 = await getConsultationPhotosR2();
  if (r2) return 'r2';
  if (ensureFsDir()) return 'fs';
  return 'memory';
}

// ── Blob I/O ───────────────────────────────────────────────────────────────

/**
 * Persist bytes to preferred backend. Never throws across backends.
 * @param {string} objectKey
 * @param {Buffer} buffer
 * @param {string} [contentType]
 * @returns {Promise<'r2' | 'fs' | 'memory'>}
 */
export async function putPhotoBytes(objectKey, buffer, contentType) {
  const r2 = await getConsultationPhotosR2();
  if (r2) {
    try {
      await r2.put(objectKey, buffer, {
        httpMetadata: contentType ? { contentType } : undefined
      });
      // L1 cache for same-isolate reads immediately after write
      memoryFiles.set(objectKey, buffer);
      return 'r2';
    } catch {
      // Bucket missing / permission / network — fall through
    }
  }

  if (ensureFsDir()) {
    try {
      const full = path.join(DATA_DIR, objectKey);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, buffer);
      return 'fs';
    } catch {
      // fall through to memory
    }
  }

  memoryFiles.set(objectKey, buffer);
  return 'memory';
}

/**
 * Load bytes. Order: memory → R2 → FS (memory first for same-isolate hits).
 * @param {string} objectKey
 * @returns {Promise<Buffer | null>}
 */
export async function getPhotoBytes(objectKey) {
  if (!objectKey) return null;

  const mem = memoryFiles.get(objectKey);
  if (mem) return mem;

  const r2 = await getConsultationPhotosR2();
  if (r2) {
    try {
      const obj = await r2.get(objectKey);
      if (obj) {
        const ab = await obj.arrayBuffer();
        const buf = Buffer.from(ab);
        memoryFiles.set(objectKey, buf);
        return buf;
      }
    } catch {
      // ignore and try FS
    }
  }

  if (ensureFsDir()) {
    try {
      const full = path.join(DATA_DIR, objectKey);
      if (fs.existsSync(full)) {
        const buf = fs.readFileSync(full);
        memoryFiles.set(objectKey, buf);
        return buf;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Best-effort delete from all known backends.
 * @param {string} objectKey
 */
export async function deletePhotoBytes(objectKey) {
  if (!objectKey) return;
  memoryFiles.delete(objectKey);

  const r2 = await getConsultationPhotosR2();
  if (r2) {
    try {
      await r2.delete(objectKey);
    } catch {
      // best-effort
    }
  }

  if (fsWritable !== false) {
    try {
      const full = path.join(DATA_DIR, objectKey);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    } catch {
      // best-effort
    }
  }
}

/** @internal test helper — clear in-memory map */
export function _resetMemoryFilesForTests() {
  memoryFiles.clear();
  fsWritable = null;
}
