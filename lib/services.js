// PLACEHOLDER service menu — see OPEN_ITEMS.md.
// Names, durations, and prices are invented until Emily confirms her real menu.
// Copy polished for brand voice only — not a confirmation of the business menu.

export const SERVICES = [
  {
    id: 'signature-dew-facial',
    name: 'Signature Dew Facial',
    duration_minutes: 60,
    price: 145,
    description:
      'Cleanse, exfoliate, extract, finish. A full barrier read, then a plan for what the skin needs that day — not a fixed script.',
    note: 'The one to start with.'
  },
  {
    id: 'chemical-peel',
    name: 'Chemical Peel',
    duration_minutes: 45,
    price: 160,
    description:
      'Targeted resurfacing after a skin read. Strength and formula follow your barrier that week, not a one-size protocol.',
    note: 'Resurfacing, chosen after the read.'
  },
  {
    id: 'dermaplane-facial',
    name: 'Dermaplane + Facial',
    duration_minutes: 75,
    price: 175,
    description:
      'Physical exfoliation to clear the surface, then a full treatment on skin that can absorb what follows.',
    note: 'Clear the surface, then treat.'
  },
  {
    id: 'back-facial',
    name: 'Back Facial',
    duration_minutes: 50,
    price: 130,
    description:
      'The area most people skip — cleansed, extracted, calmed, and protected with the same care as the face.',
    note: 'The area everyone skips.'
  },
  {
    id: 'express-glow',
    name: 'Express Glow',
    duration_minutes: 30,
    price: 85,
    description:
      'A shorter visit between full facials: cleanse, light exfoliation, and a targeted mask.',
    note: 'When time is short.'
  },
  {
    id: 'consultation',
    name: 'Skin Consultation',
    duration_minutes: 25,
    price: 45,
    description:
      'No treatment — a read only. Barrier, actives, order of operations. Applied toward a facial booked the same day.',
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
