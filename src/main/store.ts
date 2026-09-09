import Store from 'electron-store';
import type { Settings, Preset, Ritual, Stats, MixData, CustomSound } from '../shared/types';

interface SchemaShape {
  settings: Settings;
  presets: Preset[];
  rituals: Ritual[];
  stats: Stats;
  mix: MixData;
  customSounds: CustomSound[];
}

const defaultSettings: Settings = {
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

const defaultStats: Stats = {
  days: [],
  sessionCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalMinutes: 0,
};

const defaultMix: MixData = { levels: {}, favorites: [] };

const store = new Store<SchemaShape>({
  name: 'focus-buddy-data',
  defaults: {
    settings: defaultSettings,
    presets: [],
    rituals: [],
    stats: defaultStats,
    mix: defaultMix,
    customSounds: [],
  },
});

export function getSettings(): Settings {
  return { ...defaultSettings, ...store.get('settings') };
}
export function setSettings(s: Settings) {
  store.set('settings', s);
}
export function getPresets(): Preset[] {
  return store.get('presets');
}
export function setPresets(p: Preset[]) {
  store.set('presets', p);
}
export function getRituals(): Ritual[] {
  return store.get('rituals');
}
export function setRituals(r: Ritual[]) {
  store.set('rituals', r);
}
export function getStats(): Stats {
  return store.get('stats');
}
export function setStats(s: Stats) {
  store.set('stats', s);
}
export function getMix(): MixData {
  return store.get('mix');
}
export function setMix(m: MixData) {
  store.set('mix', m);
}
export function getCustomSounds(): CustomSound[] {
  return store.get('customSounds');
}
export function setCustomSounds(list: CustomSound[]) {
  store.set('customSounds', list);
}
