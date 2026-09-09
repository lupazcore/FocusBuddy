import type { StateCreator } from 'zustand';
import type { SessionStoreState } from './types';
import type { LivingMixIntensity, SessionPhase } from '@shared/types';

export interface SessionSlice extends SessionStoreState {
  startFocusCycle: (workMinutes: number, breakMinutes: number) => void;
  startWindDown: (minutes: number) => void;
  advancePhase: () => void;
  stopSession: () => void;
  tick: () => void;
  setLivingMix: (enabled: boolean, intensity: LivingMixIntensity) => void;
}

function minutesFromNow(min: number): number {
  return Date.now() + min * 60_000;
}

export const createSessionSlice: StateCreator<SessionSlice, [], [], SessionSlice> = (set, get) => ({
  phase: 'idle',
  endsAt: null,
  focusWorkMinutes: 25,
  focusBreakMinutes: 5,
  windDownMinutes: 30,
  livingMixEnabled: false,
  livingMixIntensity: 'subtle',
  now: Date.now(),

  startFocusCycle: (workMinutes, breakMinutes) => {
    window.focusBuddy?.session.setActive(true);
    set({
      phase: 'focus-work',
      endsAt: minutesFromNow(workMinutes),
      focusWorkMinutes: workMinutes,
      focusBreakMinutes: breakMinutes,
    });
  },

  startWindDown: (minutes) => {
    window.focusBuddy?.session.setActive(false);
    set({ phase: 'wind-down', endsAt: minutesFromNow(minutes), windDownMinutes: minutes });
  },

  advancePhase: () => {
    const { phase, focusWorkMinutes, focusBreakMinutes } = get();
    if (phase === 'focus-work') {
      set({ phase: 'focus-break', endsAt: minutesFromNow(focusBreakMinutes) });
      window.focusBuddy?.notifications.show('Break time', 'Focus stretch done. Take a breather.');
    } else if (phase === 'focus-break') {
      set({ phase: 'focus-work', endsAt: minutesFromNow(focusWorkMinutes) });
      window.focusBuddy?.notifications.show('Back to it', 'Break is over. Let\u2019s focus.');
    } else {
      window.focusBuddy?.session.setActive(false);
      set({ phase: 'idle', endsAt: null });
      window.focusBuddy?.notifications.show('Wind-down complete', 'Sleep well.');
    }
  },

  stopSession: () => {
    window.focusBuddy?.session.setActive(false);
    set({ phase: 'idle', endsAt: null });
  },

  tick: () => set({ now: Date.now() }),

  setLivingMix: (enabled, intensity) => set({ livingMixEnabled: enabled, livingMixIntensity: intensity }),
});
