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
    
    const playGentleChime = () => {
      try {
        const ctx = new window.AudioContext();
        const now = ctx.currentTime;
        
        // Play the chime 3 times, spaced by 1.0 seconds
        for (let i = 0; i < 3; i++) {
          const t = now + (i * 1.0);
          
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, t); // D5
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880.00, t); // A5

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 1.5);
          osc2.stop(t + 1.5);
        }
      } catch (e) {
        console.error('Failed to play gentle chime', e);
      }
    };

    if (phase === 'focus-work') {
      set({ phase: 'focus-break', endsAt: minutesFromNow(focusBreakMinutes) });
      playGentleChime();
      window.focusBuddy?.notifications.show(
        'Break time', 
        `Nice work. Take ${focusBreakMinutes} minutes before the next round.`, 
        true
      );
    } else if (phase === 'focus-break') {
      set({ phase: 'focus-work', endsAt: minutesFromNow(focusWorkMinutes) });
      playGentleChime();
      window.focusBuddy?.notifications.show(
        'Back to it', 
        'Break\'s over. Next round starts now.', 
        true
      );
    } else {
      window.focusBuddy?.session.setActive(false);
      set({ phase: 'idle', endsAt: null });
      playGentleChime();
      window.focusBuddy?.notifications.show('Wind-down complete', 'Sleep well.', true);
    }
  },

  stopSession: () => {
    window.focusBuddy?.session.setActive(false);
    set({ phase: 'idle', endsAt: null });
  },

  tick: () => set({ now: Date.now() }),

  setLivingMix: (enabled, intensity) => set({ livingMixEnabled: enabled, livingMixIntensity: intensity }),
});
