// PLACEHOLDER service menu — see OPEN_ITEMS.md.
// Names, durations, and prices are invented until Emily confirms her real menu.

export const SERVICES = [
  {
    id: 'signature-dew-facial',
    name: 'Signature Dew Facial',
    duration_minutes: 60,
    price: 145,
    description:
      'Cleanse, exfoliate, extract, finish. A full read of the barrier, then a plan built around what the skin needs that day — not a fixed protocol.',
    note: 'The one to start with.'
  },
  {
    id: 'chemical-peel',
    name: 'Chemical Peel',
    duration_minutes: 45,
    price: 160,
    description:
      'Targeted resurfacing chosen after a skin read. Strength and formula are selected for your barrier that week, not a one-size protocol.',
    note: 'Targeted resurfacing, chosen after a skin read.'
  },
  {
    id: 'dermaplane-facial',
    name: 'Dermaplane + Facial',
    duration_minutes: 75,
    price: 175,
    description:
      'Physical exfoliation to clear the surface, then a full treatment on skin that can actually absorb what follows.',
    note: 'Physical exfoliation, then a full treatment on clear skin.'
  },
  {
    id: 'back-facial',
    name: 'Back Facial',
    duration_minutes: 50,
    price: 130,
    description:
      'The area everyone skips, treated with the same care as the face — cleanse, extract, calm, protect.',
    note: 'The area everyone skips, treated properly.'
  },
  {
    id: 'express-glow',
    name: 'Express Glow',
    duration_minutes: 30,
    price: 85,
    description:
      'A shorter appointment for maintenance between full facials: cleanse, light exfoliation, and a targeted mask.',
    note: 'Between appointments, when time is short.'
  },
  {
    id: 'consultation',
    name: 'Skin Consultation',
    duration_minutes: 25,
    price: 45,
    description:
      'No treatment — just a read. Barrier, actives, order of operations. Applied toward a facial booked the same day.',
    note: 'A plan before a product haul.'
  }
];

export function getService(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

export function formatDuration(minutes) {
  return `${minutes} min`;
}

export function formatServicePrice(price) {
  return `$${Number(price).toFixed(0)}`;
}
