import React from 'react';

type Props = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function MixIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="7" height="10" rx="2" />
      <rect x="14" y="3" width="7" height="6" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" />
      <rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  );
}

export function SessionsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 3h10M7 21h10" />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
    </svg>
  );
}

export function RitualsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="15.5" cy="15.5" r="2.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StreaksIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 21V11M12 21V4M18 21v-7" />
    </svg>
  );
}

export function DenIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20V6a2 2 0 0 1 2-2h5v16" />
      <path d="M11 4l6.5 1.2A2 2 0 0 1 19 7.2V20" />
      <path d="M4 20h15" />
    </svg>
  );
}

export function SettingsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.15-1.44l2-1.55-2-3.46-2.36.95a7 7 0 0 0-1.24-.72L15 3h-4l-.25 2.78a7 7 0 0 0-1.24.72L7.15 5.55l-2 3.46 2 1.55A7 7 0 0 0 7 12c0 .49.05.97.15 1.44l-2 1.55 2 3.46 2.36-.95c.38.29.8.53 1.24.72L11 21h4l.25-2.78c.44-.19.86-.43 1.24-.72l2.36.95 2-3.46-2-1.55c.1-.47.15-.95.15-1.44Z" />
    </svg>
  );
}

export function PlayIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function StarIcon({ className, filled }: Props & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth={2} fill={filled ? 'currentColor' : 'none'}>
      <path
        d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8Z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function CloseIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MinimizeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function MaximizeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}
