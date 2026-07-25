import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTokenPair, hashToken, tokensMatch } from '../lib/consultations/tokens.js';
import { validateIntakeSubmission } from '../lib/consultations/intake-schema.js';
import {
  canSubmitIntake,
  nextActionLabel,
  REQUIRED_PHOTO_SLOTS
} from '../lib/consultations/statuses.js';

describe('consultation tokens', () => {
  it('creates matching hash pairs', () => {
    const { token, hash } = createTokenPair();
    assert.ok(token.length > 20);
    assert.equal(hash, hashToken(token));
    assert.equal(tokensMatch(token, hash), true);
    assert.equal(tokensMatch('wrong', hash), false);
  });
});

describe('intake schema', () => {
  it('rejects incomplete intake', () => {
    const r = validateIntakeSubmission({});
    assert.equal(r.ok, false);
    assert.ok(r.details?.length);
  });

  it('accepts valid intake with consent', () => {
    const r = validateIntakeSubmission({
      full_name: 'Test Client',
      age: 30,
      email: 'client@example.com',
      skin_concerns: 'Dryness and redness',
      morning_routine: 'Cleanser, moisturizer, SPF',
      night_routine: 'Cleanser, cream',
      consent: {
        accuracy: true,
        photos: true,
        aesthetic_not_medical: true,
        privacy: true,
        seek_medical: true
      }
    });
    assert.equal(r.ok, true);
    assert.equal(r.intake.email, 'client@example.com');
    assert.equal(r.intake.age, 30);
  });

  it('requires all consent flags', () => {
    const r = validateIntakeSubmission({
      full_name: 'Test Client',
      age: 30,
      email: 'client@example.com',
      skin_concerns: 'Acne',
      morning_routine: 'Wash',
      night_routine: 'Wash',
      consent_accuracy: true,
      consent_photos: true,
      consent_aesthetic: true,
      consent_privacy: false,
      consent_medical: true
    });
    assert.equal(r.ok, false);
    assert.equal(r.code, 'consent_required');
  });
});

describe('consultation statuses', () => {
  it('blocks intake when payment pending', () => {
    assert.equal(canSubmitIntake('payment_pending'), false);
    assert.equal(canSubmitIntake('paid'), true);
    assert.equal(canSubmitIntake('cancelled'), false);
  });

  it('labels next actions', () => {
    assert.match(nextActionLabel({ status: 'scheduling_pending' }), /Schedule/i);
    assert.match(nextActionLabel({ status: 'intake_submitted' }), /Review/i);
  });

  it('lists required photo slots', () => {
    assert.ok(REQUIRED_PHOTO_SLOTS.includes('front'));
    assert.ok(REQUIRED_PHOTO_SLOTS.includes('chin_jawline'));
    assert.equal(REQUIRED_PHOTO_SLOTS.includes('area_of_concern'), false);
  });
});
