import React, { useEffect, useState } from 'react';
import type { NowPlayingState } from '@shared/types';
import { PlayIcon, PauseIcon, CloseIcon } from './icons/NavIcons';

export function MiniPlayerApp() {
  const [state, setState] = useState<NowPlayingState>({
    isPlaying: false,
    label: 'Focus Buddy',
    phase: 'idle',
    remainingSeconds: null,
  });
  
  useEffect(() => {
    if (!state.theme) return;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = state.theme === 'dark' || (state.theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('oled', !!state.oledMode && isDark);
  }, [state.theme, state.oledMode]);

  useEffect(() => {
    const offState = window.focusBuddy.miniPlayer.onState(setState);
    window.focusBuddy.miniPlayer.sendCommand('request-state');
    return () => { offState(); };
  }, []);

  const time =
    typeof state.remainingSeconds === 'number'
      ? `${String(Math.floor(state.remainingSeconds / 60)).padStart(2, '0')}:${String(state.remainingSeconds % 60).padStart(2, '0')}`
      : null;

  return (
    <div className="drag-region w-full h-full bg-[color:var(--paper)] border-[3px] border-[color:var(--ink)] rounded-[18px] flex items-center gap-3 px-4">
      <button
        type="button"
        className="no-drag w-10 h-10 rounded-full border-[3px] border-[color:var(--ink)] bg-gold flex items-center justify-center shrink-0 text-[color:var(--charcoal)]"
        onClick={() => window.focusBuddy.miniPlayer.sendCommand('toggle-play')}
        aria-label={state.isPlaying ? 'Pause' : 'Play'}
      >
        {state.isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-struct font-bold text-xs truncate">{state.label}</p>
        {time && <p className="mono-num text-xs opacity-85">{time}</p>}
      </div>
      <button
        type="button"
        className="no-drag w-7 h-7 flex items-center justify-center rounded-full hover:bg-[color:color-mix(in_srgb,var(--ink)_10%,transparent)]"
        onClick={() => window.focusBuddy.window.close()}
        aria-label="Close floating player"
      >
        <CloseIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
