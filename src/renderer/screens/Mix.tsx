import React, { useMemo, useRef, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { SoundTile } from '../components/SoundTile';
import { Tile } from '../components/Tile';
import { SearchIcon, StarIcon } from '../components/icons/NavIcons';
import { StaggerReveal } from '../components/StaggerReveal';
import { useStore } from '../store';
import { BUILT_IN_SOUNDS, STARTER_BLENDS } from '../data/sounds';
import type { SoundDef } from '@shared/types';


export function Mix({ transportPlaying }: { transportPlaying: boolean }) {
  const settings = useStore((s) => s.settings);
  const levels = useStore((s) => s.levels);
  const favorites = useStore((s) => s.favorites);
  const presets = useStore((s) => s.presets);
  const customSounds = useStore((s) => s.customSounds);
  const setLevel = useStore((s) => s.setLevel);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const applyLevels = useStore((s) => s.applyLevels);
  const savePreset = useStore((s) => s.savePreset);
  const deletePreset = useStore((s) => s.deletePreset);

  const [query, setQuery] = useState('');
  const [presetName, setPresetName] = useState('');
  const firstLaunch = useRef(!localStorage.getItem('fb-tiles-seen'));
  React.useEffect(() => {
    localStorage.setItem('fb-tiles-seen', '1');
  }, []);

  const allSounds: SoundDef[] = useMemo(
    () => [
      ...BUILT_IN_SOUNDS,
      ...customSounds.map((c) => ({ id: c.id, name: c.name, family: 'gold' as const, icon: 'keyboard' })),
    ],
    [customSounds],
  );

  const filtered = useMemo(
    () => allSounds.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [allSounds, query],
  );

  const favoriteSounds = useMemo(
    () => allSounds.filter((s) => favorites.includes(s.id)),
    [allSounds, favorites],
  );

  const anyPlaying = Object.values(levels).some((v) => v > 0);

  const soundGridClass =
    settings.density === 'compact'
      ? 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5'
      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4';

  return (
    <StaggerReveal>
      <SectionHeader
        section="Mix"
        title="Build tonight's mix."
        action={
          <div className="flex items-center gap-2">
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Name this mix…"
              className="border-[3px] border-[color:var(--ink)] rounded-xl px-3 py-2 text-sm font-struct bg-[color:var(--card)] focus-ring"
            />
            <button
              type="button"
              disabled={!presetName.trim() || !anyPlaying}
              onClick={() => {
                savePreset(presetName.trim());
                setPresetName('');
              }}
              className="bg-violet text-white font-struct font-semibold text-sm px-4 py-2.5 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save mix
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm shrink-0">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sounds…"
            aria-label="Search sounds"
            className="w-full pl-10 pr-3 py-2.5 border-[3px] border-[color:var(--ink)] rounded-xl bg-[color:var(--card)] font-struct text-sm focus-ring"
          />
        </div>

        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex-1 min-w-0 ${
            anyPlaying ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'
          }`}
        >
          <div className="tile-small border-[3px] border-[color:var(--ink)] rounded-xl px-4 py-2 bg-[color:var(--card)] w-max max-w-full">
            <p className="font-struct text-sm opacity-85 truncate">Nothing playing. Tap a sound to start your mix.</p>
          </div>
        </div>
      </div>

      {favoriteSounds.length > 0 && (
        <section className="mb-8">
          <h2 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-3 flex items-center gap-2">
            <StarIcon filled className="w-4 h-4" /> Favorites
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {favoriteSounds.map((sound, i) => (
              <div key={sound.id} className="w-40 shrink-0">
                <SoundTile
                  sound={sound}
                  level={levels[sound.id] || 0}
                  isPlaying={transportPlaying && (levels[sound.id] ?? 0) > 0}
                  isFavorite={true}
                  onLevelChange={(val) => setLevel(sound.id, val)}
                  onToggleFavorite={() => toggleFavorite(sound.id)}
                  index={i}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-3">All Sounds</h2>
        {filtered.length === 0 ? (
          <Tile as="div" shadow="small" pressable={false} className="p-4">
            <p className="font-struct text-sm opacity-85">No sounds match “{query}.”</p>
          </Tile>
        ) : (
          <div className={soundGridClass}>
            {filtered.map((sound, i) => (
              <SoundTile
                key={sound.id}
                sound={sound}
                level={levels[sound.id] || 0}
                isPlaying={transportPlaying && (levels[sound.id] ?? 0) > 0}
                isFavorite={favorites.includes(sound.id)}
                onLevelChange={(val) => setLevel(sound.id, val)}
                onToggleFavorite={() => toggleFavorite(sound.id)}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-3">Presets</h2>
        {presets.length === 0 ? (
          <Tile as="div" shadow="small" pressable={false} className="p-4 bg-[color:var(--card)]">
            <p className="font-struct text-sm opacity-85">
              No presets yet. Build a mix above and tap “Save mix” to keep it here.
            </p>
          </Tile>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {presets.map((preset) => (
              <div key={preset.id} className="relative w-48 shrink-0">
                <Tile
                  shadow="normal"
                  onClick={() => applyLevels(preset.levels)}
                  className="w-full h-24 p-4 flex flex-col justify-between text-left bg-violet text-white"
                >
                  <p className="font-struct font-bold text-sm truncate">{preset.name}</p>
                  <p className="text-xs opacity-90">{Object.keys(preset.levels).length} sounds</p>
                </Tile>
                <button
                  type="button"
                  aria-label={`Delete ${preset.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[color:var(--card)] border-[3px] border-[color:var(--ink)] flex items-center justify-center text-xs font-bold focus-ring hover:bg-red-500 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-3">Starter blends</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STARTER_BLENDS.map((blend, i) => (
            <Tile
              key={blend.id}
              shadow="normal"
              onClick={() => applyLevels(blend.levels)}
              className="p-4 text-left h-32 flex flex-col justify-between bg-gold"
            >
              <div>
                <p className="font-struct font-bold text-sm">{blend.name}</p>
                <p className="text-xs mt-1 opacity-90">{blend.description}</p>
              </div>
              <p className="text-[11px] font-struct font-semibold uppercase tracking-wide opacity-85">
                Tap to start from this blend
              </p>
            </Tile>
          ))}
        </div>
      </section>
    </StaggerReveal>
  );
}
