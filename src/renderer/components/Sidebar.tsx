import React from 'react';
import { MixIcon, SessionsIcon, RitualsIcon, StreaksIcon, DenIcon, SettingsIcon } from './icons/NavIcons';
import { LupazBadge } from './LupazBadge';

export type ScreenId = 'mix' | 'sessions' | 'rituals' | 'streaks' | 'den' | 'settings';

const NAV: { id: ScreenId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'mix', label: 'Mix', icon: MixIcon },
  { id: 'sessions', label: 'Sessions', icon: SessionsIcon },
  { id: 'rituals', label: 'Rituals', icon: RitualsIcon },
  { id: 'streaks', label: 'Streaks', icon: StreaksIcon },
  { id: 'den', label: 'The Den', icon: DenIcon },
];

export function Sidebar({
  current,
  onNavigate,
  version,
}: {
  current: ScreenId;
  onNavigate: (id: ScreenId) => void;
  version: string;
}) {
  return (
    <nav className="group w-[72px] hover:w-[220px] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 bg-[color:var(--sidebar)] text-white flex flex-col h-full overflow-hidden relative">
      <div className="drag-region h-9 shrink-0" />
      <div className="px-3 pb-4">
        <LogoLockup onNavigate={onNavigate} />
      </div>
      <ul className="flex-1 px-3 space-y-1.5 overflow-x-hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`no-drag w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-[3px] font-struct font-semibold text-sm transition-all duration-200 focus-ring whitespace-nowrap overflow-hidden ${
                  active
                    ? 'bg-gold text-black border-[color:var(--ink)] shadow-small tile-pressable'
                    : 'border-transparent text-white/75 hover:text-white hover:border-white hover:bg-black hover:shadow-small hover:scale-[1.03]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="px-3 pb-2 overflow-x-hidden">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          aria-current={current === 'settings' ? 'page' : undefined}
          className={`no-drag w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-[3px] font-struct font-semibold text-sm transition-all duration-200 focus-ring whitespace-nowrap overflow-hidden ${
            current === 'settings'
              ? 'bg-gold text-black border-[color:var(--ink)] shadow-small tile-pressable'
              : 'border-transparent text-white/75 hover:text-white hover:border-white hover:bg-black hover:shadow-small hover:scale-[1.03]'
          }`}
        >
          <SettingsIcon className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
      <LupazBadge version={version} />
    </nav>
  );
}

function LogoLockup({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate('mix')}
      className="no-drag w-full rounded-xl border-[3px] border-[color:var(--ink)] bg-gold shadow-small px-3 py-2.5 flex items-center gap-3 tile-pressable focus-ring overflow-hidden"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0">
        <mask id="crescent">
          <rect width="20" height="20" fill="white" />
          <circle cx="12" cy="8" r="6" fill="black" />
        </mask>
        <circle cx="8" cy="10" r="7" fill="black" mask="url(#crescent)" />
        <path d="M17 5c1 0.6 1 2.4 0 3M18.5 3.5c1.6 1.2 1.6 4.8 0 6" stroke="black" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-struct font-bold tracking-tight text-black text-sm whitespace-nowrap">FOCUS BUDDY</span>
    </button>
  );
}
