import { create } from 'zustand';
import { createMixSlice, type MixSlice } from './mixSlice';
import { createSessionSlice, type SessionSlice } from './sessionSlice';
import { createRitualsSlice, type RitualsSlice } from './ritualsSlice';
import { createSettingsSlice, type SettingsSlice } from './settingsSlice';
import { createStatsSlice, type StatsSlice } from './statsSlice';
import type { CustomSound } from '@shared/types';

interface CustomSoundsSlice {
  customSounds: CustomSound[];
  setCustomSounds: (list: CustomSound[]) => void;
}

type AppState = MixSlice & SessionSlice & RitualsSlice & SettingsSlice & StatsSlice & CustomSoundsSlice;

export const useStore = create<AppState>()((set, get, api) => ({
  ...createMixSlice(set, get, api),
  ...createSessionSlice(set, get, api),
  ...createRitualsSlice(set, get, api),
  ...createSettingsSlice(set, get, api),
  ...createStatsSlice(set, get, api),
  customSounds: [],
  setCustomSounds: (list) => set({ customSounds: list }),
}));

// Debounce persistence so slider drags don't spam electron-store.
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  };
}

const persistMix = debounce((levels: Record<string, number>, favorites: string[]) => {
  window.focusBuddy?.store.setMix({ levels, favorites });
}, 400);

const persistPresets = debounce((presets: MixSlice['presets']) => {
  window.focusBuddy?.store.setPresets(presets);
}, 250);

const persistRituals = debounce((rituals: RitualsSlice['rituals']) => {
  window.focusBuddy?.store.setRituals(rituals);
}, 250);

const persistSettings = debounce((settings: SettingsSlice['settings']) => {
  window.focusBuddy?.store.setSettings(settings);
}, 250);

const persistStats = debounce((stats: StatsSlice['stats']) => {
  window.focusBuddy?.store.setStats(stats);
}, 1000);

let lastLevels: Record<string, number> | null = null;
let lastFavorites: string[] | null = null;
let lastPresets: MixSlice['presets'] | null = null;
let lastRituals: RitualsSlice['rituals'] | null = null;
let lastSettings: SettingsSlice['settings'] | null = null;
let lastStats: StatsSlice['stats'] | null = null;

useStore.subscribe((state) => {
  if (!state.hydrated) return;
  if (state.levels !== lastLevels || state.favorites !== lastFavorites) {
    lastLevels = state.levels;
    lastFavorites = state.favorites;
    persistMix(state.levels, state.favorites);
  }
  if (state.presets !== lastPresets) {
    lastPresets = state.presets;
    persistPresets(state.presets);
  }
  if (state.rituals !== lastRituals) {
    lastRituals = state.rituals;
    persistRituals(state.rituals);
  }
  if (state.settings !== lastSettings) {
    lastSettings = state.settings;
    persistSettings(state.settings);
  }
  if (state.stats !== lastStats) {
    lastStats = state.stats;
    persistStats(state.stats);
  }
});
