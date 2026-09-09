import React, { useEffect, useRef, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Tile } from '../components/Tile';
import { Select } from '../components/Select';
import { StaggerReveal } from '../components/StaggerReveal';
import { useStore } from '../store';
import type { ThemeMode, TileDensity, UpdateStatus } from '@shared/types';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Tile as="div" pressable={false} shadow="normal" className="p-6 mb-5">
      <h3 className="font-struct font-bold text-base mb-4">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </Tile>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="max-w-sm">
        <p className="font-struct font-semibold text-sm">{label}</p>
        {description && <p className="text-xs opacity-75 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className={`w-14 h-8 rounded-full border-[3px] border-[color:var(--ink)] relative focus-ring shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'tile-pressable cursor-pointer'
      } ${
        checked ? 'bg-leaf' : 'bg-[color:var(--card)]'
      }`}
    >
      <span
        className={`absolute top-[1.5px] w-6 h-6 rounded-full bg-[color:var(--ink)] transition-all ${
          checked ? 'left-[25.5px]' : 'left-[1.5px]'
        }`}
      />
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-3 py-2 rounded-xl border-[3px] font-struct font-semibold text-xs tile-pressable focus-ring ${
            value === o.id ? 'bg-gold text-black border-[color:var(--ink)]' : 'bg-[color:var(--card)] border-[color:var(--ink)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

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

export function Settings({ version }: { version: string }) {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const presets = useStore((s) => s.presets);
  const rituals = useStore((s) => s.rituals);
  const setPresets = useStore((s) => s.setPresets);
  const setRituals = useStore((s) => s.setRituals);
  const prefersDark = useMediaQueryDark();
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [shortcutDraft, setShortcutDraft] = useState(settings.globalShortcut);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const off = window.focusBuddy.updates.onStatus(setUpdateStatus);
    return off;
  }, []);

  useEffect(() => {
    const getDevices = () => {
      navigator.mediaDevices
        ?.enumerateDevices()
        .then((devices) => setAudioDevices(devices.filter((d) => d.kind === 'audiooutput')))
        .catch(() => undefined);
    };

    getDevices();
    navigator.mediaDevices?.addEventListener('devicechange', getDevices);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', getDevices);
  }, []);

  const handleExport = () => {
    const payload = { settings, presets, rituals, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focus-buddy-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.settings) updateSettings(data.settings);
        if (Array.isArray(data.presets)) setPresets(data.presets);
        if (Array.isArray(data.rituals)) setRituals(data.rituals);
      } catch {
        window.focusBuddy.notifications.show('Import failed', 'That file doesn\u2019t look like a Focus Buddy backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <StaggerReveal className="pb-12 max-w-3xl mx-auto">
      <SectionHeader section="Settings" title="Make it yours." />

      <Group title="Appearance">
        <Row label="Theme">
          <Segmented<ThemeMode>
            options={[
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
              { id: 'system', label: 'System' },
            ]}
            value={settings.theme}
            onChange={(theme) => updateSettings({ theme })}
          />
        </Row>
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isDark ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none -mt-4'
          }`}
        >
          <Row label="OLED pure black mode" description="Make backgrounds pitch black instead of charcoal gray.">
            <Toggle checked={settings.oledMode} onChange={(v) => updateSettings({ oledMode: v })} />
          </Row>
        </div>
        <Row label="Tile density" description="Compact fits more sounds on screen.">
          <Segmented<TileDensity>
            options={[
              { id: 'comfortable', label: 'Comfortable' },
              { id: 'compact', label: 'Compact' },
            ]}
            value={settings.density}
            onChange={(density) => updateSettings({ density })}
          />
        </Row>
      </Group>

      <Group title="Language">
        <Row label="App language">
          <Select
            value={settings.language}
            onChange={(v) => updateSettings({ language: v })}
            options={[{ value: 'en', label: 'English' }]}
            className="w-48"
          />
        </Row>
      </Group>

      <Group title="Playback">
        <Row label="Audio output device">
          <Select
            value={settings.audioOutputDeviceId}
            onChange={(v) => updateSettings({ audioOutputDeviceId: v })}
            options={[
              { value: 'default', label: 'System default' },
              ...audioDevices
                .filter(d => d.deviceId !== 'default')
                .map((d) => ({ value: d.deviceId, label: d.label || 'Audio output' }))
            ]}
            className="w-64"
          />
        </Row>
        <Row label="Fade transition duration" description="Used for timer fade-outs and mix blends.">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.5}
              value={settings.fadeDurationSec}
              onChange={(e) => updateSettings({ fadeDurationSec: Number(e.target.value) })}
              className="w-40 accent-[color:var(--violet)]"
            />
            <span className="mono-num text-sm w-10">{settings.fadeDurationSec}s</span>
          </div>
        </Row>
      </Group>

      <Group title="Startup & behavior">
        <Row label="Play last mix automatically" description="Resume where you left off when Focus Buddy opens.">
          <Toggle checked={settings.playLastMixOnLaunch} onChange={(v) => updateSettings({ playLastMixOnLaunch: v })} />
        </Row>
        <Row
          label="Deep Focus mode"
          description="Suppresses OS notifications and keeps the floating player pinned during a focus cycle."
        >
          <Toggle checked={settings.deepFocusMode} onChange={(v) => updateSettings({ deepFocusMode: v })} />
        </Row>
        <Row label="Start with system">
          <Toggle
            checked={settings.startWithSystem}
            onChange={async (v) => {
              const applied = await window.focusBuddy.autostart.set(v);
              updateSettings({ startWithSystem: applied });
            }}
          />
        </Row>
        <Row label="Launch quietly" description="Start minimized to the tray.">
          <Toggle
            checked={settings.launchMinimized}
            onChange={(v) => updateSettings({ launchMinimized: v })}
            disabled={!settings.startWithSystem}
          />
        </Row>
        <Row label="Keep playing when window is closed">
          <Toggle checked={settings.keepPlayingOnClose} onChange={(v) => updateSettings({ keepPlayingOnClose: v })} />
        </Row>
        <Row label="Global toggle shortcut" description="Play/pause and bring Focus Buddy forward from anywhere.">
          <div className="flex items-center gap-2">
            <input
              value={shortcutDraft}
              onChange={(e) => setShortcutDraft(e.target.value)}
              className="border-[3px] border-[color:var(--ink)] rounded-xl px-3 py-2 font-mono text-xs bg-[color:var(--card)] focus-ring w-56"
            />
            <button
              type="button"
              onClick={async () => {
                const ok = await window.focusBuddy.shortcuts.set(shortcutDraft);
                if (ok) updateSettings({ globalShortcut: shortcutDraft });
              }}
              className="bg-violet text-white font-struct font-semibold text-xs px-3 py-2 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
            >
              Save
            </button>
          </div>
        </Row>
      </Group>

      <Group title="Backup">
        <Row label="Export presets & settings" description="Save everything as one JSON file.">
          <button
            type="button"
            onClick={handleExport}
            className="bg-gold text-black font-struct font-semibold text-sm px-4 py-2.5 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
          >
            Export backup
          </button>
        </Row>
        <Row label="Import a backup" description="Replaces current presets, rituals, and settings.">
          <>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[color:var(--card)] font-struct font-semibold text-sm px-4 py-2.5 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
            >
              Import backup…
            </button>
          </>
        </Row>
      </Group>

      <Group title="Updates">
        <Row label="Check for updates now">
          <button
            type="button"
            onClick={() => window.focusBuddy.updates.check()}
            className="bg-violet text-white font-struct font-semibold text-sm px-4 py-2.5 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
          >
            Check now
          </button>
        </Row>
        {updateStatus && (
          <p className="text-xs font-struct opacity-85">
            {updateStatus.state === 'checking' && 'Checking for updates…'}
            {updateStatus.state === 'available' && 'An update is available.'}
            {updateStatus.state === 'not-available' && 'You\u2019re on the latest version.'}
            {updateStatus.state === 'downloaded' && 'Update downloaded. Restart to install.'}
            {updateStatus.state === 'error' && `Couldn\u2019t check for updates: ${updateStatus.message ?? 'unknown error'}`}
          </p>
        )}
        <Row label="Update automatically">
          <Toggle checked={settings.autoUpdateEnabled} onChange={(v) => updateSettings({ autoUpdateEnabled: v })} />
        </Row>
      </Group>

      <Tile as="div" pressable={false} shadow="hero"  className="p-6 bg-gold">
        <div className="flex items-center gap-4 mb-3">
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
            <rect x="1" y="1" width="42" height="42" rx="12" fill="#F0B429" stroke="#000" strokeWidth="3" />
            <mask id="crescent-about">
              <rect width="44" height="44" fill="white" />
              <circle cx="27" cy="17" r="8" fill="black" />
            </mask>
            <circle cx="18" cy="20" r="9" fill="#000" mask="url(#crescent-about)" />
          </svg>
          <div>
            <p className="font-struct font-bold text-lg">Focus Buddy</p>
            <p className="mono-num text-xs">v{version}</p>
          </div>
        </div>
        <p className="text-sm mb-2">One app, every focus. Ambient sound, sessions, and rituals in one place.</p>
        <p className="text-sm font-struct font-semibold">Crafted by Lupaz</p>
        <p className="text-xs opacity-85 mt-3">
          Focus Buddy is free and open source under the MIT license. Bundled sounds are original or licensed
          royalty-free see LICENSES.md in the repository.
        </p>
      </Tile>
    </StaggerReveal>
  );
}
