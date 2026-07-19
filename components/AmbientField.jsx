/**
 * Fixed soft-chrome fields behind the whole site.
 * Gives .glass-1 / .glass-2 something textured to blur against —
 * no stock photography required.
 */
export default function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="ambient-orb ambient-orb--ice" />
      <span className="ambient-orb ambient-orb--lavender" />
      <span className="ambient-orb ambient-orb--blush" />
      <span className="ambient-orb ambient-orb--chrome" />
      <span className="ambient-mesh" />
    </div>
  );
}
