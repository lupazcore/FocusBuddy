type SoundFamily = 'leaf' | 'gold';

export interface SoundDef {
  id: string;
  name: string;
  family: SoundFamily;
  icon: string;
  variable?: boolean; // eligible for Living Mix drift
}

export interface CustomSound {
  id: string;
  name: string;
  fileName: string;
  importedAt: number;
}

export interface Preset {
  id: string;
  name: string;
  levels: Record<string, number>;
  createdAt: number;
}

export interface StarterBlend {
  id: string;
  name: string;
  description: string;
  levels: Record<string, number>;
}

export type LivingMixIntensity = 'subtle' | 'moderate' | 'lively';

export interface LivingMixConfig {
  enabled: boolean;
  intensity: LivingMixIntensity;
}


export type SessionPhase = 'idle' | 'focus-work' | 'focus-break' | 'wind-down';

export interface Ritual {
  id: string;
  name: string;
  enabled: boolean;
  days: number[]; // 0 = Sunday .. 6 = Saturday
  time: string; // "HH:MM" 24h
  presetId: string | null;
  durationMinutes: number;
  lastFiredKey?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type TileDensity = 'comfortable' | 'compact';

export interface Settings {
  theme: ThemeMode;
  oledMode: boolean;
  density: TileDensity;
  language: string;
  audioOutputDeviceId: string;
  fadeDurationSec: number;
  playLastMixOnLaunch: boolean;
  deepFocusMode: boolean;
  startWithSystem: boolean;
  launchMinimized: boolean;
  keepPlayingOnClose: boolean;
  autoUpdateEnabled: boolean;
  globalShortcut: string;
  livingMix: LivingMixConfig;
}

export interface StatsDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  soundsPlayed: Record<string, number>;
}

export interface Stats {
  days: StatsDay[];
  sessionCount: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
}

export interface MixData {
  levels: Record<string, number>;
  favorites: string[];
}

export interface NowPlayingState {
  isPlaying: boolean;
  label: string;
  phase: SessionPhase;
  remainingSeconds: number | null;
  theme?: 'light' | 'dark' | 'system';
  oledMode?: boolean;
}

export interface UpdateStatus {
  state: 'checking' | 'available' | 'not-available' | 'downloaded' | 'error';
  message?: string;
}

export interface FocusBuddyAPI {
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<NodeJS.Platform>;
  };
  store: {
    getSettings: () => Promise<Settings>;
    setSettings: (s: Settings) => Promise<void>;
    getPresets: () => Promise<Preset[]>;
    setPresets: (p: Preset[]) => Promise<void>;
    getRituals: () => Promise<Ritual[]>;
    setRituals: (r: Ritual[]) => Promise<void>;
    getStats: () => Promise<Stats>;
    setStats: (s: Stats) => Promise<void>;
    getMix: () => Promise<MixData>;
    setMix: (m: MixData) => Promise<void>;
  };
  dialog: {
    pickAudioFiles: () => Promise<string[]>;
  };
  sounds: {
    importCustom: (filePaths: string[]) => Promise<CustomSound[]>;
    getCustomList: () => Promise<CustomSound[]>;
    removeCustom: (id: string) => Promise<void>;
    builtInUrl: (fileName: string) => string;
    customUrl: (fileName: string) => string;
  };
  notifications: {
    show: (title: string, body: string) => void;
  };
  autostart: {
    set: (enabled: boolean) => Promise<boolean>;
  };
  shortcuts: {
    set: (accelerator: string) => Promise<boolean>;
    onTriggered: (cb: () => void) => () => void;
  };
  updates: {
    check: () => void;
    onStatus: (cb: (status: UpdateStatus) => void) => () => void;
  };
  miniPlayer: {
    open: () => void;
    pushState: (state: NowPlayingState) => void;
    onState: (cb: (state: NowPlayingState) => void) => () => void;
    sendCommand: (cmd: 'toggle-play' | 'stop' | 'request-state') => void;
    onCommand: (cb: (cmd: 'toggle-play' | 'stop' | 'request-state') => void) => () => void;
  };
  media: {
    onKey: (cb: (key: 'play-pause') => void) => () => void;
  };
  session: {
    setActive: (active: boolean) => void;
  };
}
