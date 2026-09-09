import type { StateCreator } from 'zustand';
import type { MixStoreState } from './types';
import type { Preset } from '@shared/types';

export interface MixSlice extends MixStoreState {
  presets: Preset[];
  setLevel: (id: string, percent: number) => void;
  applyLevels: (levels: Record<string, number>) => void;
  toggleFavorite: (id: string) => void;
  hydrateMix: (levels: Record<string, number>, favorites: string[]) => void;
  setPresets: (presets: Preset[]) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
}

export const createMixSlice: StateCreator<MixSlice, [], [], MixSlice> = (set, get) => ({
  levels: {},
  favorites: [],
  presets: [],
  hydrated: false,

  setLevel: (id, percent) =>
    set((s) => ({ levels: { ...s.levels, [id]: Math.max(0, Math.min(100, Math.round(percent))) } })),

  applyLevels: (levels) => set({ levels: { ...levels } }),

  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
    })),

  hydrateMix: (levels, favorites) => set({ levels, favorites, hydrated: true }),

  setPresets: (presets) => set({ presets }),

  savePreset: (name) => {
    const { levels, presets } = get();
    const preset: Preset = {
      id: crypto.randomUUID(),
      name,
      levels: { ...levels },
      createdAt: Date.now(),
    };
    set({ presets: [...presets, preset] });
  },

  deletePreset: (id) => set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
});
