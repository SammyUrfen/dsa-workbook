/* DSA Workbook logo: a stylized algorithm/tree solving a peak.
   Uses CSS custom properties for light/dark theme support. */
export default function Logo({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DSA Workbook"
      style={{ display: 'block', color: 'inherit' }}
    >
      {/* Peak outline (mountain shape) */}
      <path
        d="M 50 15 L 75 75 L 25 75 Z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />

      {/* Node path (ascending left side): represents the algorithm solving upward */}
      <circle cx="35" cy="60" r="3.5" fill="var(--accent)" />
      <circle cx="42" cy="48" r="3.5" fill="var(--accent)" />
      <circle cx="48" cy="36" r="3.5" fill="var(--accent)" />
      <circle cx="50" cy="20" r="4" fill="var(--accent-2)" />

      {/* Connecting lines */}
      <line
        x1="35"
        y1="60"
        x2="42"
        y2="48"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="42"
        y1="48"
        x2="48"
        y2="36"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="48"
        y1="36"
        x2="50"
        y2="20"
        stroke="var(--accent-2)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Accent dot at peak (solved!) */}
      <circle cx="50" cy="20" r="2.2" fill="var(--accent-soft)" />
    </svg>
  )
}
