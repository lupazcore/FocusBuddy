import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar, type ScreenId } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { TransportBar } from './components/TransportBar';
import { Mix } from './screens/Mix';
import { Sessions } from './screens/Sessions';
import { Rituals } from './screens/Rituals';
import { Streaks } from './screens/Streaks';
import { Den } from './screens/Den';
import { Settings } from './screens/Settings';
import { useStore } from './store';
import { audioEngine } from './audio/AudioEngine';
import { BUILT_IN_SOUNDS, SOUND_FILE_MAP } from './data/sounds';
import { ScreenSkeleton } from './components/Skeleton';
import type { NowPlayingState } from '@shared/types';

function useMediaQueryDark(): boolean {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDark;
}

export default function App() {
  const [screen, setScreenInternal] = useState<ScreenId>('mix');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [version, setVersion] = useState('1.0.0');
  const [platform, setPlatform] = useState<NodeJS.Platform | null>(null);
  const [transportPlaying, setTransportPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [hydrated, setHydrated] = useState(false);

  const setScreen = (newScreen: ScreenId) => {
    if (newScreen === screen) return;
    setIsTransitioning(true);
    setScreenInternal(newScreen);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const levels = useStore((s) => s.levels);

  const presets = useStore((s) => s.presets);
  const customSounds = useStore((s) => s.customSounds);
  const settings = useStore((s) => s.settings);
  const rituals = useStore((s) => s.rituals);
  const ritualsEnabled = useStore((s) => s.ritualsEnabled);
  const phase = useStore((s) => s.phase);
  const endsAt = useStore((s) => s.endsAt);
  const livingMixEnabled = useStore((s) => s.livingMixEnabled);
  const livingMixIntensity = useStore((s) => s.livingMixIntensity);

  const hydrateMix = useStore((s) => s.hydrateMix);
  const setPresets = useStore((s) => s.setPresets);
  const setRituals = useStore((s) => s.setRituals);
  const setSettings = useStore((s) => s.setSettings);
  const setStats = useStore((s) => s.setStats);
  const setCustomSoundsStore = useStore((s) => s.setCustomSounds);
  const advancePhase = useStore((s) => s.advancePhase);
  const stopSession = useStore((s) => s.stopSession);
  const tick = useStore((s) => s.tick);
  const logMinute = useStore((s) => s.logMinute);
  const logSessionComplete = useStore((s) => s.logSessionComplete);
  const applyLevels = useStore((s) => s.applyLevels);
  const updateRitual = useStore((s) => s.updateRitual);

  const prefersDark = useMediaQueryDark();
  const prevLevels = useRef<Record<string, number>>({});
  const secondTickAccum = useRef(0);

  useEffect(() => {
    (async () => {
      const api = window.focusBuddy;
      const [v, p, mix, pr, rit, st, custom] = await Promise.all([
        api.app.getVersion(),
        api.app.getPlatform(),
        api.store.getMix(),
        api.store.getPresets(),
        api.store.getRituals(),
        api.store.getSettings(),
        api.sounds.getCustomList(),
      ]);
      setVersion(v);
      setPlatform(p);
      hydrateMix(mix.levels, mix.favorites);
      setPresets(pr);
      setRituals(rit);
      setSettings(st);
      setCustomSoundsStore(custom);
      const stats = await api.store.getStats();
      setStats(stats);

      if (st.playLastMixOnLaunch && Object.values(mix.levels).some((v2) => v2 > 0)) {
        setTransportPlaying(true);
      }
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('oled', dark && settings.oledMode);
  }, [settings.theme, prefersDark, settings.oledMode]);

  useEffect(() => {
    document.body.dataset.density = settings.density;
  }, [settings.density]);

  const urlsById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const sound of BUILT_IN_SOUNDS) {
      map[sound.id] = window.focusBuddy.sounds.builtInUrl(SOUND_FILE_MAP[sound.id]);
    }
    for (const c of customSounds) {
      map[c.id] = window.focusBuddy.sounds.customUrl(c.fileName);
    }
    return map;
  }, [customSounds]);

  const variableIds = useMemo(() => new Set(BUILT_IN_SOUNDS.filter((s) => s.variable).map((s) => s.id)), []);

  useEffect(() => {
    if (!hydrated) return;
    const fade = settings.fadeDurationSec;

    if (!transportPlaying) {
      audioEngine.pause(Math.min(fade, 1.2));
      return;
    }
    
    audioEngine.resume(fade);

    const prev = prevLevels.current;
    for (const id of Object.keys(levels)) {
      const next = levels[id] ?? 0;
      const before = prev[id] ?? 0;
      const url = urlsById[id];
      if (!url) continue;
      if (next > 0 && before === 0) {
        audioEngine.play(id, url, next, fade);
      } else if (next === 0 && before > 0) {
        audioEngine.stop(id, fade);
      } else if (next !== before) {
        audioEngine.setLevel(id, next, 0.15);
      }
    }
    for (const id of Object.keys(prev)) {
      if (!(id in levels) || (levels[id] ?? 0) === 0) {
        if (audioEngine.isPlaying(id)) audioEngine.stop(id, fade);
      }
    }
    prevLevels.current = { ...levels };

    const activeVariable = Object.keys(levels).filter((id) => (levels[id] ?? 0) > 0 && variableIds.has(id));
    if (livingMixEnabled) {
      audioEngine.enableLivingMix(activeVariable, livingMixIntensity);
      audioEngine.updateLivingMixMembership(activeVariable);
    } else {
      audioEngine.disableLivingMix();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, transportPlaying, hydrated, urlsById, livingMixEnabled, livingMixIntensity]);

  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    if (settings.audioOutputDeviceId && settings.audioOutputDeviceId !== 'default') {
      audioEngine.setOutputDevice(settings.audioOutputDeviceId);
    }
  }, [settings.audioOutputDeviceId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick();
      if (endsAt !== null && Date.now() >= endsAt) {
        advancePhase();
        if (Date.now() >= endsAt) logSessionComplete();
      }

      secondTickAccum.current += 1;
      if (secondTickAccum.current >= 60) {
        secondTickAccum.current = 0;
        if (transportPlaying) {
          const activeIds = Object.keys(levels).filter((id) => (levels[id] ?? 0) > 0);
          if (activeIds.length > 0) logMinute(activeIds);
        }
      }

      if (ritualsEnabled) {
        checkRituals();
      }
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, transportPlaying, levels, ritualsEnabled, rituals, presets]);

  function checkRituals() {
    const now = new Date();
    const day = now.getDay();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;
    const todayKey = `${now.toISOString().slice(0, 10)}T${timeStr}`;

    for (const ritual of rituals) {
      if (!ritual.enabled) continue;
      if (!ritual.days.includes(day)) continue;
      if (ritual.time !== timeStr) continue;
      if (ritual.lastFiredKey === todayKey) continue;

      const preset = presets.find((p) => p.id === ritual.presetId);
      if (preset) {
        applyLevels(preset.levels);
        setTransportPlaying(true);
        window.setTimeout(() => {
          setTransportPlaying(false);
        }, ritual.durationMinutes * 60_000);
      }
      updateRitual(ritual.id, { lastFiredKey: todayKey });
      window.focusBuddy.notifications.show('Ritual started', `${ritual.name} is now playing.`);
    }
  }

  useEffect(() => {
    if (settings.deepFocusMode && phase === 'focus-work') {
      window.focusBuddy.miniPlayer.open();
    }
  }, [settings.deepFocusMode, phase]);

  useEffect(() => {
    const remaining = endsAt ? Math.max(0, Math.floor((endsAt - Date.now()) / 1000)) : undefined;
    const label =
      phase === 'focus-work' ? 'Focus time' : phase === 'focus-break' ? 'Break time' : phase === 'wind-down' ? 'Winding down' : 'Focus Buddy';
    const state: NowPlayingState = { isPlaying: transportPlaying, label, phase, remainingSeconds: remaining, theme: settings.theme, oledMode: settings.oledMode };
    window.focusBuddy.miniPlayer.pushState(state);
  }, [transportPlaying, phase, endsAt, settings.theme, settings.oledMode]);

  useEffect(() => {
    const offCommand = window.focusBuddy.miniPlayer.onCommand((cmd) => {
      if (cmd === 'toggle-play') setTransportPlaying((p) => !p);
      if (cmd === 'stop') stopSession();
      if (cmd === 'request-state') {
        const remaining = endsAt ? Math.max(0, Math.floor((endsAt - Date.now()) / 1000)) : undefined;
        const label =
          phase === 'focus-work' ? 'Focus time' : phase === 'focus-break' ? 'Break time' : phase === 'wind-down' ? 'Winding down' : 'Focus Buddy';
        window.focusBuddy.miniPlayer.pushState({ isPlaying: transportPlaying, label, phase, remainingSeconds: remaining, theme: settings.theme, oledMode: settings.oledMode });
      }
    });
    const offShortcut = window.focusBuddy.shortcuts.onTriggered(() => {
      window.focusBuddy.window.isMaximized().then(() => {
        setTransportPlaying((p) => !p);
      });
    });
    const offMedia = window.focusBuddy.media.onKey(() => setTransportPlaying((p) => !p));
    return () => {
      offCommand();
      offShortcut();
      offMedia();
    };
  }, [stopSession, transportPlaying, phase, endsAt, settings.theme, settings.oledMode]);

  if (!hydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[color:var(--paper)]">
        <p className="font-struct text-sm opacity-75">Waking up Focus Buddy…</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[color:var(--paper)] text-[color:var(--ink)] overflow-hidden">
      <TitleBar platform={platform} />
      <div className="flex flex-1 min-h-0">
        <Sidebar current={screen} onNavigate={setScreen} version={version} />
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto dot-grid">
            <div className="max-w-6xl mx-auto px-8 py-8 relative">
              {isTransitioning ? (
                <ScreenSkeleton screen={screen} />
              ) : (
                <div className="w-full">
                  {screen === 'mix' && <Mix transportPlaying={transportPlaying} />}
                  {screen === 'sessions' && <Sessions />}
                  {screen === 'rituals' && <Rituals />}
                  {screen === 'streaks' && <Streaks />}
                  {screen === 'den' && <Den />}
                  {screen === 'settings' && <Settings version={version} />}
                </div>
              )}
            </div>
          </div>
          <TransportBar
            isPlaying={transportPlaying}
            onTogglePlay={() => setTransportPlaying((p) => !p)}
            masterVolume={masterVolume}
            onMasterVolumeChange={setMasterVolume}
            onOpenMiniPlayer={() => window.focusBuddy.miniPlayer.open()}
          />
        </main>
      </div>
    </div>
  );
}
