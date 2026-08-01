'use client';

/**
 * Quiet ambient wash only — no floating orbs.
 * Solid pearl surfaces don't need heavy blur refraction fields.
 */
export default function AmbientField() {
  return (
    <div
      className="ambient-field ambient-field--quiet"
      aria-hidden="true"
      data-ambient="quiet"
    >
      <span className="ambient-mesh" />
    </div>
  );
}
