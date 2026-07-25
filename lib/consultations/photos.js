/**
 * Private consultation photo storage.
 * - Prefer R2 binding CONSULTATION_PHOTOS_R2 when available (Workers)
 * - Else local FS: data/runtime/consultation-photos/<key>
 * - Else in-memory Map (Workers without R2 / read-only FS)
 * - No public object URLs; access only via authorized admin/intake session routes.
 */
import { createHash, randomBytes } from 'crypto';
import { mutateStore, readStore } from '../store.js';
import { PHOTO_SLOTS, REQUIRED_PHOTO_SLOTS } from './statuses.js';
import { getConsultationById, getConsultationByIntakeToken } from './service.js';
import {
  ALLOWED_MIME,
  MAX_BYTES,
  detectMime,
  isAllowedMime,
  isAllowedSlot as isAllowedSlotInList,
  missingRequiredSlots,
  randomObjectKey,
  putPhotoBytes,
  getPhotoBytes,
  deletePhotoBytes
} from './photo-storage.js';

export function isAllowedSlot(slot) {
  return isAllowedSlotInList(slot, PHOTO_SLOTS);
}

export function requiredSlotsMissing(consultationId) {
  const photos = listPhotos(consultationId);
  const present = photos.map((p) => p.slot);
  return missingRequiredSlots(present, REQUIRED_PHOTO_SLOTS);
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
 * Async so R2 put can complete when the binding is present.
 * @param {{ consultationId: string, slot: string, buffer: Buffer, claimedMime?: string, originalName?: string }} args
 */
export async function storePhoto({ consultationId, slot, buffer, claimedMime, originalName }) {
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
  if (!mime || !isAllowedMime(mime)) {
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

  const backend = await putPhotoBytes(objectKey, buffer, mime);

  const record = {
    id,
    consultation_id: consultationId,
    slot,
    object_key: objectKey,
    storage_backend: backend,
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

  // Soft-delete prior single-slot photos (except area_of_concern which allows multiples)
  /** @type {string[]} */
  const keysToDrop = [];
  mutateStore((s) => {
    if (!Array.isArray(s.consultation_photos)) s.consultation_photos = [];
    if (slot !== 'area_of_concern') {
      for (const p of s.consultation_photos) {
        if (p.consultation_id === consultationId && p.slot === slot && !p.deleted_at) {
          p.deleted_at = new Date().toISOString();
          if (p.object_key) keysToDrop.push(p.object_key);
        }
      }
    }
    s.consultation_photos.unshift(record);
    return s;
  });

  await Promise.all(keysToDrop.map((k) => deletePhotoBytes(k)));

  return { ok: true, photo: publicPhotoMeta(record) };
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

/**
 * Read private photo bytes after auth checks.
 * @param {string} photoId
 * @param {{ admin?: boolean, intakeToken?: string | null }} [opts]
 */
export async function readPhotoBytes(photoId, { admin = false, intakeToken = null } = {}) {
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

  const buffer = await getPhotoBytes(photo.object_key);
  if (!buffer) {
    return { ok: false, status: 404, error: 'File missing', code: 'file_missing' };
  }

  return { ok: true, photo, buffer };
}

/**
 * Soft-delete photo metadata + best-effort blob removal.
 * @param {string} photoId
 * @param {{ admin?: boolean, intakeToken?: string | null }} [opts]
 */
export async function deletePhoto(photoId, { admin = false, intakeToken = null } = {}) {
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

  const objectKey = photo.object_key;
  mutateStore((store) => {
    if (!Array.isArray(store.consultation_photos)) return store;
    const p = store.consultation_photos.find((x) => x.id === photoId);
    if (p) {
      p.deleted_at = new Date().toISOString();
    }
    return store;
  });
  await deletePhotoBytes(objectKey);
  return { ok: true };
}

export function assertAdminPhotoAccess(consultationId) {
  return Boolean(getConsultationById(consultationId));
}

export {
  MAX_BYTES,
  ALLOWED_MIME,
  REQUIRED_PHOTO_SLOTS,
  PHOTO_SLOTS,
  detectMime,
  isAllowedMime,
  missingRequiredSlots
};
