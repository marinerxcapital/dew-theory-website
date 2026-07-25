/**
 * Server + client-safe intake validation.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v, max = 2000) {
  return String(v ?? '')
    .trim()
    .slice(0, max);
}

function bool(v) {
  return v === true || v === 'true' || v === 1 || v === '1';
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, intake: object } | { ok: false, status: number, error: string, code: string, field?: string, details?: Array }}
 */
export function validateIntakeSubmission(body) {
  const b = body && typeof body === 'object' ? body : {};
  const details = [];

  const full_name = str(b.full_name, 200);
  const ageRaw = b.age;
  const age = ageRaw === '' || ageRaw == null ? null : Math.floor(Number(ageRaw));
  const email = str(b.email, 320).toLowerCase();

  if (!full_name) {
    details.push({ field: 'full_name', error: 'Full name is required', code: 'required' });
  }
  if (age == null || !Number.isFinite(age) || age < 13 || age > 120) {
    details.push({ field: 'age', error: 'Enter a valid age', code: 'invalid_age' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    details.push({ field: 'email', error: 'Valid email is required', code: 'invalid_email' });
  }

  const skin_concerns = str(b.skin_concerns, 4000);
  const skin_goals = str(b.skin_goals, 2000);
  const skin_type = str(b.skin_type, 120);
  const sensitivities = str(b.sensitivities, 2000);
  const allergies = str(b.allergies, 2000);
  const morning_routine = str(b.morning_routine, 4000);
  const night_routine = str(b.night_routine, 4000);

  if (!skin_concerns) {
    details.push({
      field: 'skin_concerns',
      error: 'Describe your primary skin concerns',
      code: 'required'
    });
  }
  if (!morning_routine) {
    details.push({
      field: 'morning_routine',
      error: 'Morning routine is required',
      code: 'required'
    });
  }
  if (!night_routine) {
    details.push({ field: 'night_routine', error: 'Night routine is required', code: 'required' });
  }

  let products = [];
  if (Array.isArray(b.products)) {
    products = b.products
      .slice(0, 40)
      .map((p) => ({
        brand: str(p?.brand, 120),
        product_name: str(p?.product_name, 200),
        frequency: str(p?.frequency, 80),
        notes: str(p?.notes, 500)
      }))
      .filter((p) => p.brand || p.product_name);
  }

  const prescription_skincare = str(b.prescription_skincare, 2000);
  const medications = str(b.medications, 2000);
  const supplements = str(b.supplements, 2000);
  const medical_conditions = str(b.medical_conditions, 2000);
  const pregnancy_status = str(b.pregnancy_status, 120);
  const prior_procedures = {
    botox: bool(b.prior_procedures?.botox ?? b.proc_botox),
    fillers: bool(b.prior_procedures?.fillers ?? b.proc_fillers),
    lasers: bool(b.prior_procedures?.lasers ?? b.proc_lasers),
    microneedling: bool(b.prior_procedures?.microneedling ?? b.proc_microneedling),
    peels: bool(b.prior_procedures?.peels ?? b.proc_peels),
    other: str(b.prior_procedures?.other ?? b.proc_other, 500)
  };
  const procedure_notes = str(b.procedure_notes, 2000);

  const lifestyle = {
    sleep: str(b.lifestyle?.sleep ?? b.sleep, 200),
    stress: str(b.lifestyle?.stress ?? b.stress, 200),
    water_intake: str(b.lifestyle?.water_intake ?? b.water_intake, 200),
    smoking_vaping: str(b.lifestyle?.smoking_vaping ?? b.smoking_vaping, 200),
    diet_notes: str(b.lifestyle?.diet_notes ?? b.diet_notes, 1000),
    hormonal_notes: str(b.lifestyle?.hormonal_notes ?? b.hormonal_notes, 1000),
    makeup_habits: str(b.lifestyle?.makeup_habits ?? b.makeup_habits, 500),
    spf_habits: str(b.lifestyle?.spf_habits ?? b.spf_habits, 500),
    other: str(b.lifestyle?.other ?? b.lifestyle_other, 1000)
  };

  const preferences = {
    budget: str(b.preferences?.budget ?? b.budget, 200),
    complexity: str(b.preferences?.complexity ?? b.complexity, 120),
    time_morning: str(b.preferences?.time_morning ?? b.time_morning, 120),
    time_evening: str(b.preferences?.time_evening ?? b.time_evening, 120),
    questions_for_emily: str(b.preferences?.questions_for_emily ?? b.questions_for_emily, 2000)
  };

  const consent = {
    accuracy: bool(b.consent?.accuracy ?? b.consent_accuracy),
    photos: bool(b.consent?.photos ?? b.consent_photos),
    aesthetic_not_medical: bool(b.consent?.aesthetic_not_medical ?? b.consent_aesthetic),
    privacy: bool(b.consent?.privacy ?? b.consent_privacy),
    seek_medical: bool(b.consent?.seek_medical ?? b.consent_medical),
    policy_version: str((b.consent?.policy_version ?? b.policy_version) || '2026-07', 40),
    consented_at: new Date().toISOString()
  };

  if (!consent.accuracy || !consent.photos || !consent.aesthetic_not_medical || !consent.privacy || !consent.seek_medical) {
    details.push({
      field: 'consent',
      error: 'All consent acknowledgements are required',
      code: 'consent_required'
    });
  }

  if (details.length) {
    return {
      ok: false,
      status: 400,
      error: details[0].error,
      code: details[0].code,
      field: details[0].field,
      details
    };
  }

  return {
    ok: true,
    intake: {
      full_name,
      age,
      email,
      skin_concerns,
      skin_goals,
      skin_type,
      sensitivities,
      allergies,
      morning_routine,
      night_routine,
      products,
      prescription_skincare,
      medications,
      supplements,
      medical_conditions,
      pregnancy_status,
      prior_procedures,
      procedure_notes,
      lifestyle,
      preferences,
      consent,
      submitted_at: new Date().toISOString()
    }
  };
}
