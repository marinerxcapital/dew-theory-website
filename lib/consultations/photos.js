/**
 * Private consultation photo storage.
 * - Local/dev: data/runtime/consultation-photos/<random-key>
 * - No public object URLs; access only via authorized admin/intake session routes.
 */
import fs from 'fs';
import path from 'path';
import { createHash, randomBytes } from 'crypto';
import { mutateStore, readStore } from '../store.js';
import { PHOTO_SLOTS, REQUIRED_PHOTO_SLOTS } from './statuses.js';
import { getConsultationById, getConsultationByIntakeToken } from './service.js';

const DATA_DIR = path.join(process.cwd(), 'data', 'runtime', 'consultation-photos');
const MAX_BYTES = Number(process.env.CONSULTATION_PHOTO_MAX_BYTES || 10 * 1024 * 1024);
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]);

/** @type {Map<string, Buffer>} */
const memoryFiles = new Map();
let fsWritable = null;

function ensureDir() {
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

function randomObjectKey(slot) {
  const id = randomBytes(16).toString('hex');
  const safeSlot = String(slot).replace(/[^a-z0-9_]/gi, '').slice(0, 40);
  return `${safeSlot}/${id}`;
}

function detectMime(buf, claimed) {
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

export function isAllowedSlot(slot) {
  return PHOTO_SLOTS.includes(slot);
}

export function requiredSlotsMissing(consultationId) {
  const photos = listPhotos(consultationId);
  const present = new Set(photos.map((p) => p.slot));
  return REQUIRED_PHOTO_SLOTS.filter((s) => !present.has(s));
}

export function listPhotos(consultationId) {
  const s = readStore();
  const photos = Array.isArray(s.consultation_photos) ? s.consultation_photos : [];
  return photos.filter((p) => p.consultation_id === consultationId && !p.deleted_at);
}

/**
 * Authorize upload for intake token holder.
 */
export function authorizeIntakeUpload(rawToken, slot) {
  const consultation = getConsultationByIntakeToken(rawToken);
  if (!consultation) {
    return { ok: false, status: 404, error: 'Invalid intake link', code: 'intake_not_found' };
  }
  if (consultation.payment_status !== 'paid') {
    return { ok: false, status: 402, error: 'Payment required', code: 'payment_required' };
  }
  if (!isAllowedSlot(slot)) {
    return { ok: false, status: 400, error: 'Invalid photo slot', code: 'invalid_slot' };
  }
  if (consultation.status === 'cancelled' || consultation.status === 'refunded') {
    return { ok: false, status: 400, error: 'Consultation closed', code: 'closed' };
  }
  return { ok: true, consultation };
}

/**
 * Store photo bytes privately and register metadata.
 * @param {{ consultationId: string, slot: string, buffer: Buffer, claimedMime?: string, originalName?: string }} args
 */
export function storePhoto({ consultationId, slot, buffer, claimedMime, originalName }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { ok: false, status: 400, error: 'Empty file', code: 'empty_file' };
  }
  if (buffer.length > MAX_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `File too large (max ${Math.round(MAX_BYTES / (1024 * 1024))} MB)`,
      code: 'file_too_large'
    };
  }

  const mime = detectMime(buffer, claimedMime);
  if (!mime || !ALLOWED_MIME.has(mime)) {
    return {
      ok: false,
      status: 400,
      error: 'Unsupported image type. Use JPEG, PNG, WebP, or HEIC.',
      code: 'invalid_mime'
    };
  }
  if (!isAllowedSlot(slot)) {
    return { ok: false, status: 400, error: 'Invalid photo slot', code: 'invalid_slot' };
  }

  const objectKey = randomObjectKey(slot);
  const id = `ph_${Date.now()}_${randomBytes(4).toString('hex')}`;
  const checksum = createHash('sha256').update(buffer).digest('hex');

  if (ensureDir()) {
    const full = path.join(DATA_DIR, objectKey);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, buffer);
  } else {
    memoryFiles.set(objectKey, buffer);
  }

  const record = {
    id,
    consultation_id: consultationId,
    slot,
    object_key: objectKey,
    mime_type: mime,
    byte_size: buffer.length,
    width: null,
    height: null,
    original_filename: originalName
      ? String(originalName).replace(/[^\w.\- ]+/g, '').slice(0, 120)
      : null,
    checksum,
    upload_status: 'ready',
    created_at: new Date().toISOString(),
    deleted_at: null
  };

  mutateStore((s) => {
    if (!Array.isArray(s.consultation_photos)) s.consultation_photos = [];
    // Replace single-slot photos (except area_of_concern which allows multiples)
    if (slot !== 'area_of_concern') {
      for (const p of s.consultation_photos) {
        if (p.consultation_id === consultationId && p.slot === slot && !p.deleted_at) {
          p.deleted_at = new Date().toISOString();
          softDeleteObject(p.object_key);
        }
      }
    }
    s.consultation_photos.unshift(record);
    return s;
  });

  return { ok: true, photo: publicPhotoMeta(record) };
}

function softDeleteObject(objectKey) {
  if (!objectKey) return;
  memoryFiles.delete(objectKey);
  if (fsWritable) {
    try {
      const full = path.join(DATA_DIR, objectKey);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    } catch {
      // best-effort
    }
  }
}

export function publicPhotoMeta(record) {
  if (!record) return null;
  return {
    id: record.id,
    consultation_id: record.consultation_id,
    slot: record.slot,
    mime_type: record.mime_type,
    byte_size: record.byte_size,
    upload_status: record.upload_status,
    created_at: record.created_at
  };
}

export function readPhotoBytes(photoId, { admin = false, intakeToken = null } = {}) {
  const s = readStore();
  const photos = Array.isArray(s.consultation_photos) ? s.consultation_photos : [];
  const photo = photos.find((p) => p.id === photoId && !p.deleted_at);
  if (!photo) {
    return { ok: false, status: 404, error: 'Not found', code: 'not_found' };
  }

  if (admin) {
    // caller must have already verified admin
  } else if (intakeToken) {
    const c = getConsultationByIntakeToken(intakeToken);
    if (!c || c.id !== photo.consultation_id) {
      return { ok: false, status: 403, error: 'Forbidden', code: 'forbidden' };
    }
  } else {
    return { ok: false, status: 403, error: 'Forbidden', code: 'forbidden' };
  }

  let buffer = memoryFiles.get(photo.object_key);
  if (!buffer && ensureDir()) {
    try {
      const full = path.join(DATA_DIR, photo.object_key);
      if (fs.existsSync(full)) buffer = fs.readFileSync(full);
    } catch {
      buffer = null;
    }
  }
  if (!buffer) {
    return { ok: false, status: 404, error: 'File missing', code: 'file_missing' };
  }

  return { ok: true, photo, buffer };
}

export function deletePhoto(photoId, { admin = false, intakeToken = null } = {}) {
  const loaded = readPhotoBytes(photoId, { admin, intakeToken });
  // readPhotoBytes requires file — check metadata only
  const s = readStore();
  const photos = Array.isArray(s.consultation_photos) ? s.consultation_photos : [];
  const photo = photos.find((p) => p.id === photoId && !p.deleted_at);
  if (!photo) return { ok: false, status: 404, error: 'Not found', code: 'not_found' };

  if (!admin) {
    const c = getConsultationByIntakeToken(intakeToken);
    if (!c || c.id !== photo.consultation_id) {
      return { ok: false, status: 403, error: 'Forbidden', code: 'forbidden' };
    }
  }

  mutateStore((store) => {
    if (!Array.isArray(store.consultation_photos)) return store;
    const p = store.consultation_photos.find((x) => x.id === photoId);
    if (p) {
      p.deleted_at = new Date().toISOString();
      softDeleteObject(p.object_key);
    }
    return store;
  });
  return { ok: true };
}

export function assertAdminPhotoAccess(consultationId) {
  return Boolean(getConsultationById(consultationId));
}

export { MAX_BYTES, ALLOWED_MIME, REQUIRED_PHOTO_SLOTS };
