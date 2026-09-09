import type { StateCreator } from 'zustand';
import type { Settings } from '@shared/types';

export interface SettingsSlice {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  oledMode: false,
  density: 'comfortable',
  language: 'en',
  audioOutputDeviceId: 'default',
  fadeDurationSec: 2.5,
  playLastMixOnLaunch: false,
  deepFocusMode: false,
  startWithSystem: false,
  launchMinimized: false,
  keepPlayingOnClose: true,
  autoUpdateEnabled: true,
  globalShortcut: 'CommandOrControl+Alt+Space',
  livingMix: { enabled: false, intensity: 'subtle' },
};

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => set({ settings }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
});
