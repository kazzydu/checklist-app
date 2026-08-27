export default function Logo({ size = 48, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 150 140"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="arrowShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#059669" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Checklist bars */}
      <rect x="10" y="10" width="80" height="12" rx="6" fill="url(#blueGrad)" opacity="0.9" />
      <rect x="10" y="28" width="80" height="12" rx="6" fill="url(#blueGrad)" opacity="0.75" />
      <rect x="10" y="46" width="80" height="12" rx="6" fill="url(#blueGrad)" opacity="0.6" />
      <rect x="10" y="64" width="80" height="12" rx="6" fill="url(#blueGrad)" opacity="0.45" />

      {/* Checkbox with checkmark */}
      <rect x="0" y="8" width="16" height="16" rx="3" fill="white" stroke="#10b981" strokeWidth="1.5" />
      <polyline points="4,16 7,19 13,12" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Upward arrow */}
      <path d="M 15 95 C 28 78, 40 60, 60 42 C 68 34, 80 26, 95 18"
        stroke="url(#arrowGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#arrowShadow)" />
      <polygon points="93,12 102,18 93,24" fill="url(#greenGrad)" />

      {/* Glowing star */}
      <g filter="url(#starGlow)" transform="translate(90, 0)">
        <polygon points="12,0 14.5,8.5 24,9 17,14.5 19,24 12,18.5 5,24 7,14.5 0,9 9.5,8.5"
          fill="url(#starGrad)" />
        <polygon points="12,3 13.5,9 19.5,9.5 15,13 16,19.5 12,15.5 8,19.5 9,13 4.5,9.5 10.5,9"
          fill="#6ee7b7" opacity="0.5" />
      </g>
    </svg>
  );
}
