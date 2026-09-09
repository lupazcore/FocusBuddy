import React, { useMemo, useState, useCallback } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Tile } from '../components/Tile';
import { SearchIcon } from '../components/icons/NavIcons';
import { SoundIcon } from '../components/icons/SoundIcons';
import { StaggerReveal } from '../components/StaggerReveal';
import { useStore } from '../store';
import { BUILT_IN_SOUNDS } from '../data/sounds';

export function Den() {
  const [query, setQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const customSounds = useStore((s) => s.customSounds);
  const setCustomSounds = useStore((s) => s.setCustomSounds);

  const filtered = useMemo(
    () => BUILT_IN_SOUNDS.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  const importFiles = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return;
      const created = await window.focusBuddy.sounds.importCustom(paths);
      if (created.length > 0) {
        const valid = [];
        const failedNames = [];
        let lastError = '';
        const ctx = new window.OfflineAudioContext(1, 1, 44100);

        for (const sound of created) {
          try {
            const url = window.focusBuddy.sounds.customUrl(sound.fileName);
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            await ctx.decodeAudioData(arrayBuffer);
            valid.push(sound);
          } catch (e: any) {
            console.error('Failed to decode audio:', e);
            failedNames.push(sound.name);
            lastError = e?.message || 'Unsupported format';
            await window.focusBuddy.sounds.removeCustom(sound.id);
          }
        }

        if (failedNames.length > 0) {
          window.alert(
            `Failed to decode ${failedNames.join(', ')}:\n\n${lastError}\n\nThis file format isn't supported or the file is corrupted.`
          );
        }

        if (valid.length > 0) {
          setCustomSounds([...customSounds, ...valid]);
        }
      }
    },
    [customSounds, setCustomSounds],
  );

  const handlePick = async () => {
    const paths = await window.focusBuddy.dialog.pickAudioFiles();
    await importFiles(paths);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => (f as any).path as string | undefined)
      .filter((p): p is string => Boolean(p));
    await importFiles(paths);
  };

  const handleRemove = async (id: string) => {
    await window.focusBuddy.sounds.removeCustom(id);
    setCustomSounds(customSounds.filter((c) => c.id !== id));
  };

  return (
    <StaggerReveal>
      <SectionHeader section="The Den" title="Every sound, and the ones you brought." />

      <div className="mb-6 relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the library…"
          aria-label="Search library"
          className="w-full pl-10 pr-3 py-2.5 border-[3px] border-[color:var(--ink)] rounded-xl bg-[color:var(--card)] font-struct text-sm focus-ring"
        />
      </div>

      <section className="mb-10">
        <h2 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-3">Built-in library</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((sound) => (
            <Tile as="div" pressable={false} shadow="small" key={sound.id} className="p-4 flex flex-col gap-3 min-h-[110px]">
              <div className="w-9 h-9 rounded-full border-[3px] border-[color:var(--ink)] flex items-center justify-center">
                <SoundIcon id={sound.icon} className="w-5 h-5" />
              </div>
              <p className="font-struct font-semibold text-sm">{sound.name}</p>
            </Tile>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h2 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85">Custom sounds</h2>
          <button
            type="button"
            onClick={handlePick}
            className="bg-gold text-black font-struct font-semibold text-sm px-4 py-2.5 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
          >
            Import audio file…
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-[3px] border-dashed rounded-tile p-6 mb-5 text-center transition-colors ${
            dragOver ? 'border-violet bg-violet/10' : 'border-[color:var(--ink)]/30'
          }`}
        >
          <p className="font-struct text-sm opacity-75">Drag and drop audio files here, or use the button above.</p>
        </div>

        {customSounds.length === 0 ? (
          <Tile as="div" pressable={false} shadow="small" className="p-6 text-center">
            <p className="font-struct text-sm opacity-85">No custom sounds yet. Add one to hear it here.</p>
          </Tile>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {customSounds.map((sound) => (
              <Tile as="div" pressable={false} shadow="small" key={sound.id} className="p-4 flex flex-col gap-3 min-h-[110px]">
                <div className="w-9 h-9 rounded-full border-[3px] border-[color:var(--ink)] flex items-center justify-center">
                  <SoundIcon id="keyboard" className="w-5 h-5" />
                </div>
                <p className="font-struct font-semibold text-sm truncate">{sound.name}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleRemove(sound.id)}
                    className="text-xs font-struct font-semibold underline decoration-2 underline-offset-2 focus-ring"
                  >
                    Remove
                  </button>
                </div>
              </Tile>
            ))}
          </div>
        )}
      </section>
    </StaggerReveal>
  );
}
