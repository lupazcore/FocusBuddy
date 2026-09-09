import React from 'react';
import { PlayIcon, PauseIcon } from './icons/NavIcons';
import { useStore } from '../store';

export function TransportBar({
  isPlaying,
  onTogglePlay,
  masterVolume,
  onMasterVolumeChange,
  onOpenMiniPlayer,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  masterVolume: number;
  onMasterVolumeChange: (v: number) => void;
  onOpenMiniPlayer: () => void;
}) {
  const phase = useStore((s) => s.phase);
  const endsAt = useStore((s) => s.endsAt);
  const now = useStore((s) => s.now);

  const remaining = endsAt ? Math.max(0, Math.round((endsAt - now) / 1000)) : null;
  const label =
    phase === 'focus-work' ? 'Focus' : phase === 'focus-break' ? 'Break' : phase === 'wind-down' ? 'Wind-down' : null;

  return (
    <footer className="h-20 shrink-0 border-t-[3px] border-[color:var(--ink)] bg-[color:var(--card)] px-6 flex items-center gap-6">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause mix' : 'Play mix'}
        className="w-12 h-12 rounded-full border-[3px] border-[color:var(--ink)] bg-gold flex items-center justify-center shadow-small tile-pressable focus-ring shrink-0 text-[color:var(--charcoal)]"
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
      </button>

      <div className="flex flex-col min-w-[140px]">
        {label && remaining !== null ? (
          <>
            <span className="kicker">{label.toUpperCase()}</span>
            <span className="mono-num text-lg font-bold">
              {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
            </span>
          </>
        ) : (
          <span className="text-sm font-struct opacity-75">No timer running</span>
        )}
      </div>

      <div className="flex-1 flex items-center gap-3 max-w-md">
        <span className="text-xs font-struct font-semibold uppercase tracking-wide opacity-75">Master</span>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVolume}
          onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
          aria-label="Master volume"
          className="w-full accent-[color:var(--violet)]"
        />
        <span className="mono-num text-xs w-9 text-right">{masterVolume}%</span>
      </div>

      <button
        type="button"
        onClick={onOpenMiniPlayer}
        className="ml-auto text-xs font-struct font-semibold border-[3px] border-[color:var(--ink)] rounded-xl px-3 py-2 shadow-small tile-pressable focus-ring"
      >
        Floating player
      </button>
    </footer>
  );
}
