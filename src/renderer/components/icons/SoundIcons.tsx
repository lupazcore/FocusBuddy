import React from 'react';

type Props = { className?: string };
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Droplet({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  return <path d={`M${x} ${y - r} c ${r} ${r * 1.6}, ${r} ${r * 2.4}, 0 ${r * 3.2} c -${r} -0.8, -${r} -${r * 2.4}, 0 -${r * 3.2}z`} />;
}

const SOUND_ICON_MAP: Record<string, React.FC<Props>> = {
  rain: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <Droplet x={6} y={5} />
      <Droplet x={12} y={9} />
      <Droplet x={18} y={5} />
    </svg>
  ),
  storm: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M6 10a4 4 0 0 1 1-7.9A5 5 0 0 1 17 5a4 4 0 0 1-1 8H7a4 4 0 0 1-1-3z" />
      <path d="M13 13l-3 5h3l-2 4" />
    </svg>
  ),
  wind: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M3 8h11a2.5 2.5 0 1 0-2-4" />
      <path d="M3 13h15a2.5 2.5 0 1 1-2 4" />
      <path d="M3 18h9" />
    </svg>
  ),
  waves: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M2 9c2 -3 4 -3 6 0s4 3 6 0 4 -3 6 0" />
      <path d="M2 15c2 -3 4 -3 6 0s4 3 6 0 4 -3 6 0" />
    </svg>
  ),
  stream: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M3 7c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
      <path d="M3 15c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
    </svg>
  ),
  chimes: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M5 4h14" />
      <path d="M8 4v6M13 4v9M18 4v4" />
      <circle cx="8" cy="13" r="1.2" fill="currentColor" />
      <circle cx="18" cy="11" r="1.2" fill="currentColor" />
    </svg>
  ),
  birds: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M3 12c2-3 4-3 6 0" />
      <path d="M9 12c2-3 4-3 6 0" />
      <path d="M15 8c2-3 4-3 6 0" />
    </svg>
  ),
  crickets: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <ellipse cx="12" cy="13" rx="4" ry="6" />
      <path d="M8 9l-3-2M16 9l3-2M8 17l-3 2M16 17l3 2" />
    </svg>
  ),
  fireplace: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path
        d="M12 3c1 3-2 4-2 7a4 4 0 1 0 8 0c0-1.5-1-2-1.5-1 0 2-1.5 2-1.5 0 0-2.5 2-3 1-6-1 1-3 2-4 0Z"
        fill="currentColor"
      />
    </svg>
  ),
  coffeeshop: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M5 9h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5Z" />
      <path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M8 3c0 1.2 1 1.3 1 2.5S8 7 8 7M12 3c0 1.2 1 1.3 1 2.5S12 7 12 7" />
    </svg>
  ),
  city: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M4 21V9l5-3v15M13 21V5l6 3v13M4 21h16" />
      <path d="M7 12h.01M7 16h.01M16 11h.01M16 15h.01" />
    </svg>
  ),
  train: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <rect x="5" y="4" width="14" height="12" rx="4" />
      <path d="M5 11h14M7 19l-2 2M17 19l2 2" />
      <circle cx="9" cy="15" r="0.1" />
    </svg>
  ),
  boat: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M4 14h16l-2 5H6z" />
      <path d="M8 14V5l6 4-4 2M12 14V9" />
    </svg>
  ),
  noise: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <circle cx="6" cy="7" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="4" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  keyboard: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 14h12" />
    </svg>
  ),
};

export function SoundIcon({ id, className }: { id: string; className?: string }) {
  const Comp = SOUND_ICON_MAP[id] ?? SOUND_ICON_MAP.noise;
  return <Comp className={className} />;
}
