'use client';

import { useCallback, useEffect, useState } from 'react';
import { PHOTO_SLOT_LABELS, REQUIRED_PHOTO_SLOTS } from '@/lib/consultations/statuses.js';
import LegalDocLinks from '@/components/LegalDocLinks';
import { getVirtualConsultationLegalDocuments } from '@/lib/legal-documents';

const emptyProduct = () => ({ brand: '', product_name: '', frequency: '', notes: '' });

export default function IntakeForm({ token }) {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [photos, setPhotos] = useState([]);

  const [form, setForm] = useState({
    full_name: '',
    age: '',
    email: '',
    skin_concerns: '',
    skin_goals: '',
    skin_type: '',
    sensitivities: '',
    allergies: '',
    morning_routine: '',
    night_routine: '',
    products: [emptyProduct()],
    prescription_skincare: '',
    medications: '',
    supplements: '',
    medical_conditions: '',
    pregnancy_status: '',
    proc_botox: false,
    proc_fillers: false,
    proc_lasers: false,
    proc_microneedling: false,
    proc_peels: false,
    proc_other: '',
    procedure_notes: '',
    sleep: '',
    stress: '',
    water_intake: '',
    smoking_vaping: '',
    diet_notes: '',
    hormonal_notes: '',
    makeup_habits: '',
    spf_habits: '',
    lifestyle_other: '',
    budget: '',
    complexity: '',
    time_morning: '',
    time_evening: '',
    questions_for_emily: '',
    consent_accuracy: false,
    consent_photos: false,
    consent_aesthetic: false,
    consent_privacy: false,
    consent_medical: false
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/consultations/intake/${token}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Unable to open intake');
        setLoading(false);
        return;
      }
      setMeta(data);
      setPhotos(data.photos || []);
      if (data.intake_submitted_at) {
        setDone(true);
      }
      setForm((f) => ({
        ...f,
        full_name: data.intake?.full_name || data.client_name || '',
        email: data.intake?.email || data.client_email || '',
        age: data.intake?.age != null ? String(data.intake.age) : f.age,
        ...(data.intake
          ? {
              skin_concerns: data.intake.skin_concerns || '',
              skin_goals: data.intake.skin_goals || '',
              skin_type: data.intake.skin_type || '',
              sensitivities: data.intake.sensitivities || '',
              allergies: data.intake.allergies || '',
              morning_routine: data.intake.morning_routine || '',
              night_routine: data.intake.night_routine || '',
              products:
                data.intake.products?.length > 0
                  ? data.intake.products
                  : [emptyProduct()],
              prescription_skincare: data.intake.prescription_skincare || '',
              medications: data.intake.medications || '',
              supplements: data.intake.supplements || '',
              medical_conditions: data.intake.medical_conditions || '',
              pregnancy_status: data.intake.pregnancy_status || ''
            }
          : {})
      }));
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadFile(slot, file) {
    if (!file) return;
    setUploadStatus((s) => ({ ...s, [slot]: 'Uploading…' }));
    const fd = new FormData();
    fd.set('token', token);
    fd.set('slot', slot);
    fd.set('file', file);
    try {
      const res = await fetch('/api/consultations/photos/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadStatus((s) => ({ ...s, [slot]: data.error || 'Upload failed' }));
        return;
      }
      setUploadStatus((s) => ({ ...s, [slot]: 'Uploaded' }));
      setPhotos((prev) => {
        const without =
          slot === 'area_of_concern'
            ? prev
            : prev.filter((p) => p.slot !== slot);
        return [...without, data.photo];
      });
    } catch {
      setUploadStatus((s) => ({ ...s, [slot]: 'Upload failed' }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/consultations/intake/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Submission failed');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Network error');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <p className="font-body text-sm font-light text-charcoal/70" role="status">
        Loading secure intake…
      </p>
    );
  }

  if (error && !meta) {
    return (
      <div className="glass-1 max-w-lg rounded-[3px] p-8" role="alert">
        <p className="font-display text-xl text-graphite">Intake unavailable</p>
        <p className="mt-3 font-body text-sm font-light text-charcoal/70">{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="glass-1 max-w-lg rounded-[3px] p-8" role="status">
        <p className="font-display text-2xl text-graphite">Intake received</p>
        <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
          Thank you. Emily will review your information and photos before your appointment.
          {meta?.public_ref ? ` Reference: ${meta.public_ref}.` : ''}
        </p>
      </div>
    );
  }

  const fieldClass =
    'mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40';
  const labelClass =
    'font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome';

  const allSlots = [...REQUIRED_PHOTO_SLOTS, 'area_of_concern'];

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-12">
      <header>
        <p className="eyebrow-line font-label text-[0.68rem] font-light uppercase tracking-[0.28em] text-charcoal/70">
          Secure intake
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-normal text-graphite">
          Virtual consultation intake
        </h1>
        <p className="mt-3 font-body text-sm font-light text-charcoal/70">
          {meta?.public_ref ? `Ref ${meta.public_ref}. ` : ''}
          Submit at least 24 hours before your appointment when possible.
        </p>
      </header>

      <section className="space-y-5" aria-labelledby="contact-h">
        <h2 id="contact-h" className="font-display text-xl text-graphite">
          Contact
        </h2>
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name
          </label>
          <input
            id="full_name"
            required
            className={fieldClass}
            value={form.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className={labelClass}>
              Age
            </label>
            <input
              id="age"
              type="number"
              inputMode="numeric"
              min={13}
              max={120}
              required
              className={fieldClass}
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className={fieldClass}
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="skin-h">
        <h2 id="skin-h" className="font-display text-xl text-graphite">
          Skin profile
        </h2>
        <div>
          <label htmlFor="skin_concerns" className={labelClass}>
            Primary skin concerns
          </label>
          <textarea
            id="skin_concerns"
            required
            rows={4}
            className={fieldClass}
            value={form.skin_concerns}
            onChange={(e) => setField('skin_concerns', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="skin_goals" className={labelClass}>
            Skin goals
          </label>
          <textarea
            id="skin_goals"
            rows={3}
            className={fieldClass}
            value={form.skin_goals}
            onChange={(e) => setField('skin_goals', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="skin_type" className={labelClass}>
            Known skin type (optional)
          </label>
          <input
            id="skin_type"
            className={fieldClass}
            value={form.skin_type}
            onChange={(e) => setField('skin_type', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sensitivities" className={labelClass}>
            Sensitivities
          </label>
          <textarea
            id="sensitivities"
            rows={2}
            className={fieldClass}
            value={form.sensitivities}
            onChange={(e) => setField('sensitivities', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="allergies" className={labelClass}>
            Allergies
          </label>
          <textarea
            id="allergies"
            rows={2}
            className={fieldClass}
            value={form.allergies}
            onChange={(e) => setField('allergies', e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="routine-h">
        <h2 id="routine-h" className="font-display text-xl text-graphite">
          Current routine
        </h2>
        <div>
          <label htmlFor="morning_routine" className={labelClass}>
            Morning routine
          </label>
          <textarea
            id="morning_routine"
            required
            rows={4}
            className={fieldClass}
            value={form.morning_routine}
            onChange={(e) => setField('morning_routine', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="night_routine" className={labelClass}>
            Night routine
          </label>
          <textarea
            id="night_routine"
            required
            rows={4}
            className={fieldClass}
            value={form.night_routine}
            onChange={(e) => setField('night_routine', e.target.value)}
          />
        </div>
        <div>
          <p className={labelClass}>Products currently used</p>
          {form.products.map((p, i) => (
            <div key={i} className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                placeholder="Brand"
                className={fieldClass}
                value={p.brand}
                onChange={(e) => {
                  const products = [...form.products];
                  products[i] = { ...products[i], brand: e.target.value };
                  setField('products', products);
                }}
              />
              <input
                placeholder="Product name"
                className={fieldClass}
                value={p.product_name}
                onChange={(e) => {
                  const products = [...form.products];
                  products[i] = { ...products[i], product_name: e.target.value };
                  setField('products', products);
                }}
              />
              <input
                placeholder="Frequency"
                className={fieldClass}
                value={p.frequency}
                onChange={(e) => {
                  const products = [...form.products];
                  products[i] = { ...products[i], frequency: e.target.value };
                  setField('products', products);
                }}
              />
              <input
                placeholder="Notes / reaction"
                className={fieldClass}
                value={p.notes}
                onChange={(e) => {
                  const products = [...form.products];
                  products[i] = { ...products[i], notes: e.target.value };
                  setField('products', products);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="mt-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal/70"
            onClick={() => setField('products', [...form.products, emptyProduct()])}
          >
            + Add product
          </button>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="health-h">
        <h2 id="health-h" className="font-display text-xl text-graphite">
          Health and treatment context
        </h2>
        {[
          ['prescription_skincare', 'Prescription skincare (Retin-A, isotretinoin/Accutane, etc.)'],
          ['medications', 'Medications'],
          ['supplements', 'Supplements'],
          ['medical_conditions', 'Medical conditions that affect the skin'],
          ['pregnancy_status', 'Pregnancy or breastfeeding status (if applicable)']
        ].map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            <textarea
              id={key}
              rows={key === 'pregnancy_status' ? 1 : 2}
              className={fieldClass}
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
            />
          </div>
        ))}
        <fieldset>
          <legend className={labelClass}>Previous cosmetic procedures</legend>
          <div className="mt-3 flex flex-wrap gap-4">
            {[
              ['proc_botox', 'Botox'],
              ['proc_fillers', 'Fillers'],
              ['proc_lasers', 'Lasers'],
              ['proc_microneedling', 'Microneedling'],
              ['proc_peels', 'Peels']
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 font-body text-sm font-light">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setField(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
          <input
            placeholder="Other procedures"
            className={`${fieldClass} mt-3`}
            value={form.proc_other}
            onChange={(e) => setField('proc_other', e.target.value)}
          />
          <textarea
            placeholder="Dates and notes"
            rows={2}
            className={`${fieldClass} mt-2`}
            value={form.procedure_notes}
            onChange={(e) => setField('procedure_notes', e.target.value)}
          />
        </fieldset>
      </section>

      <section className="space-y-5" aria-labelledby="life-h">
        <h2 id="life-h" className="font-display text-xl text-graphite">
          Lifestyle
        </h2>
        {[
          ['sleep', 'Average sleep'],
          ['stress', 'Stress level'],
          ['water_intake', 'Water intake'],
          ['smoking_vaping', 'Smoking / vaping'],
          ['diet_notes', 'Diet / hydration notes'],
          ['hormonal_notes', 'Hormonal-change notes'],
          ['makeup_habits', 'Makeup habits'],
          ['spf_habits', 'SPF habits'],
          ['lifestyle_other', 'Other relevant habits']
        ].map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            <input
              id={key}
              className={fieldClass}
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
            />
          </div>
        ))}
      </section>

      <section className="space-y-5" aria-labelledby="pref-h">
        <h2 id="pref-h" className="font-display text-xl text-graphite">
          Preferences
        </h2>
        {[
          ['budget', 'Skincare budget'],
          ['complexity', 'Desired routine complexity (simple / advanced)'],
          ['time_morning', 'Time available morning'],
          ['time_evening', 'Time available evening'],
          ['questions_for_emily', 'Questions for Emily']
        ].map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            {key === 'questions_for_emily' ? (
              <textarea
                id={key}
                rows={3}
                className={fieldClass}
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            ) : (
              <input
                id={key}
                className={fieldClass}
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            )}
          </div>
        ))}
      </section>

      <section className="space-y-5" aria-labelledby="photos-h">
        <h2 id="photos-h" className="font-display text-xl text-graphite">
          Photos
        </h2>
        <p className="font-body text-sm font-light text-charcoal/70">
          Natural daylight, no filters. Required slots must be uploaded before final submit.
        </p>
        <ul className="space-y-4">
          {allSlots.map((slot) => {
            const existing = photos.filter((p) => p.slot === slot);
            const required = REQUIRED_PHOTO_SLOTS.includes(slot);
            return (
              <li key={slot} className="glass-1 rounded-[2px] p-4">
                <label className="block">
                  <span className={labelClass}>
                    {PHOTO_SLOT_LABELS[slot] || slot}
                    {required ? ' (required)' : ' (optional, multiple allowed)'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    capture="environment"
                    className="mt-2 block w-full text-sm"
                    onChange={(e) => uploadFile(slot, e.target.files?.[0])}
                    aria-describedby={`upload-status-${slot}`}
                  />
                </label>
                <p id={`upload-status-${slot}`} className="mt-2 font-body text-xs text-charcoal/60" aria-live="polite">
                  {uploadStatus[slot] ||
                    (existing.length
                      ? `${existing.length} file${existing.length > 1 ? 's' : ''} uploaded`
                      : 'No file yet')}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4" aria-labelledby="consent-h">
        <h2 id="consent-h" className="font-display text-xl text-graphite">
          Consent
        </h2>
        <div className="border border-chrome/20 bg-pearl/40 px-4 py-4">
          <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
            Documents to review
          </p>
          <LegalDocLinks
            dense
            className="mt-3"
            documents={getVirtualConsultationLegalDocuments()}
          />
        </div>
        {[
          ['consent_accuracy', 'I confirm this information is accurate to my knowledge.'],
          ['consent_photos', 'I submit these photos for my virtual consultation only.'],
          [
            'consent_aesthetic',
            'I understand this is aesthetic guidance, not medical diagnosis or treatment.'
          ],
          [
            'consent_privacy',
            'I have reviewed the privacy policy and consultation terms for how my data is handled.'
          ],
          [
            'consent_medical',
            'I understand when to seek care from a licensed medical professional.'
          ]
        ].map(([key, label]) => (
          <label key={key} className="flex items-start gap-3 font-body text-sm font-light text-charcoal/80">
            <input
              type="checkbox"
              className="mt-1"
              checked={form[key]}
              onChange={(e) => setField(key, e.target.checked)}
              required
            />
            <span>{label}</span>
          </label>
        ))}
      </section>

      {error ? (
        <p className="font-body text-sm text-red-800/90" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="sweep btn-primary min-h-[44px] w-full px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Submitting…' : 'Submit intake'}
      </button>
    </form>
  );
}
