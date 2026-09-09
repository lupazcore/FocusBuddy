import type { StateCreator } from 'zustand';
import type { Ritual } from '@shared/types';

export interface RitualsSlice {
  rituals: Ritual[];
  ritualsEnabled: boolean;
  setRituals: (rituals: Ritual[]) => void;
  addRitual: (ritual: Omit<Ritual, 'id'>) => void;
  updateRitual: (id: string, patch: Partial<Ritual>) => void;
  removeRitual: (id: string) => void;
  setRitualsEnabled: (enabled: boolean) => void;
}

export const createRitualsSlice: StateCreator<RitualsSlice, [], [], RitualsSlice> = (set) => ({
  rituals: [],
  ritualsEnabled: true,

  setRituals: (rituals) => set({ rituals }),

  addRitual: (ritual) =>
    set((s) => ({ rituals: [...s.rituals, { ...ritual, id: crypto.randomUUID() }] })),

  updateRitual: (id, patch) =>
    set((s) => ({ rituals: s.rituals.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

  removeRitual: (id) => set((s) => ({ rituals: s.rituals.filter((r) => r.id !== id) })),

  setRitualsEnabled: (enabled) => set({ ritualsEnabled: enabled }),
});
