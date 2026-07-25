/** Appointment / consultation lifecycle statuses. */
export const CONSULTATION_STATUSES = [
  'payment_pending',
  'paid',
  'scheduling_pending',
  'scheduled',
  'intake_pending',
  'intake_submitted',
  'reviewed',
  'consultation_completed',
  'plan_draft',
  'plan_sent',
  'cancelled',
  'refunded'
];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export const PHOTO_SLOTS = [
  'front',
  'left',
  'right',
  'forehead',
  'cheeks',
  'chin_jawline',
  'area_of_concern'
];

export const REQUIRED_PHOTO_SLOTS = [
  'front',
  'left',
  'right',
  'forehead',
  'cheeks',
  'chin_jawline'
];

export const PHOTO_SLOT_LABELS = {
  front: 'Front of face',
  left: 'Left side',
  right: 'Right side',
  forehead: 'Close-up of forehead',
  cheeks: 'Close-up of cheeks',
  chin_jawline: 'Close-up of chin / jawline',
  area_of_concern: 'Area of concern'
};

export function isTerminalStatus(status) {
  return status === 'cancelled' || status === 'refunded';
}

export function canSubmitIntake(status) {
  return !isTerminalStatus(status) && status !== 'payment_pending';
}

export function nextActionLabel(consultation) {
  const s = consultation?.status;
  if (!s || s === 'payment_pending') return 'Awaiting payment';
  if (s === 'paid' || s === 'scheduling_pending') return 'Schedule Zoom appointment';
  if (s === 'scheduled' || s === 'intake_pending') return 'Complete intake';
  if (s === 'intake_submitted') return 'Review intake';
  if (s === 'reviewed' || s === 'consultation_completed' || s === 'plan_draft') {
    return 'Build / send plan';
  }
  if (s === 'plan_sent') return 'Complete';
  if (s === 'cancelled' || s === 'refunded') return 'Closed';
  return s;
}
