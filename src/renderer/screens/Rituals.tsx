import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Tile } from '../components/Tile';
import { Select } from '../components/Select';
import { StaggerReveal } from '../components/StaggerReveal';
import { useStore } from '../store';
import type { Ritual } from '@shared/types';

const DAYS = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

export function Rituals() {
  const rituals = useStore((s) => s.rituals);
  const ritualsEnabled = useStore((s) => s.ritualsEnabled);
  const setRitualsEnabled = useStore((s) => s.setRitualsEnabled);
  const addRitual = useStore((s) => s.addRitual);
  const updateRitual = useStore((s) => s.updateRitual);
  const removeRitual = useStore((s) => s.removeRitual);
  const presets = useStore((s) => s.presets);

  const [name, setName] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [time, setTime] = useState('22:00');
  const [presetId, setPresetId] = useState<string>('');
  const [duration, setDuration] = useState(60);

  const toggleDay = (d: number) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const canCreate = name.trim() && days.length > 0 && presetId;

  return (
    <StaggerReveal>
      <SectionHeader
        section="Rituals"
        title="Set it once, let it run itself."
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm font-struct font-semibold">Rituals</span>
            <button
              type="button"
              role="switch"
              aria-checked={ritualsEnabled}
              onClick={() => setRitualsEnabled(!ritualsEnabled)}
              className={`w-14 h-8 rounded-full border-[3px] border-ink relative tile-pressable focus-ring ${
                ritualsEnabled ? 'bg-leaf' : 'bg-[color:var(--card)]'
              }`}
            >
              <span
                className={`absolute top-[1.5px] w-6 h-6 rounded-full bg-ink transition-all ${
                  ritualsEnabled ? 'left-[25.5px]' : 'left-[1.5px]'
                }`}
              />
            </button>
          </div>
        }
      />

      <Tile as="div" shadow="normal" pressable={false} className="p-6 mb-8">
        <h3 className="font-struct font-bold text-base mb-4">New ritual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-struct font-semibold uppercase tracking-wide opacity-85 block mb-1.5">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Evening wind-down"
              className="w-full border-[3px] border-[color:var(--ink)] rounded-xl px-3 py-2 font-struct text-sm bg-[color:var(--card)] focus-ring"
            />
          </div>
          <div>
            <label className="text-xs font-struct font-semibold uppercase tracking-wide opacity-85 block mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border-[3px] border-[color:var(--ink)] rounded-xl px-3 py-2 font-struct text-sm bg-[color:var(--card)] focus-ring"
            />
          </div>
          <div>
            <label className="text-xs font-struct font-semibold uppercase tracking-wide opacity-85 block mb-1.5">
              Preset to play
            </label>
            <Select
              value={presetId}
              onChange={(v) => setPresetId(v)}
              options={[
                { value: '', label: 'Choose a saved mix…' },
                ...presets.map((p) => ({ value: p.id, label: p.name }))
              ]}
              className="w-full"
            />
            {presets.length === 0 && (
              <p className="text-xs opacity-75 mt-1">Save a mix on the Mix screen first.</p>
            )}
          </div>
          <div>
            <label className="text-xs font-struct font-semibold uppercase tracking-wide opacity-85 block mb-1.5">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border-[3px] border-[color:var(--ink)] rounded-xl px-3 py-2 font-struct text-sm bg-[color:var(--card)] focus-ring"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {DAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDay(d.id)}
              className={`px-3 py-2 rounded-xl border-[3px] font-struct font-semibold text-xs tile-pressable focus-ring ${
                days.includes(d.id) ? 'bg-gold text-black border-[color:var(--ink)]' : 'bg-[color:var(--card)] border-[color:var(--ink)]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!canCreate}
          onClick={() => {
            addRitual({
              name: name.trim(),
              enabled: true,
              days,
              time,
              presetId,
              durationMinutes: duration,
            });
            setName('');
            setDays([]);
            setPresetId('');
          }}
          className="mt-5 bg-violet text-white font-struct font-bold text-sm px-5 py-3 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Create ritual
        </button>
      </Tile>

      {rituals.length === 0 ? (
        <Tile as="div" shadow="small" pressable={false} className="p-6">
          <p className="font-struct text-sm opacity-85">No rituals set. Pick a time and Focus Buddy will start itself.</p>
        </Tile>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rituals.map((r, i) => (
            <Tile
              key={r.id}
              as="div"
              pressable={false}
              shadow="normal"
              
              className="p-5 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-struct font-bold text-base">{r.name}</p>
                  <p className="mono-num text-sm opacity-85">{r.time}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={r.enabled}
                  onClick={() => updateRitual(r.id, { enabled: !r.enabled })}
                  className={`w-11 h-6 rounded-full border-2 border-ink relative shrink-0 ${
                    r.enabled ? 'bg-leaf' : 'bg-[color:var(--card)]'
                  }`}
                >
                  <span
                    className={`absolute top-[2px] w-4 h-4 rounded-full bg-ink transition-all ${
                      r.enabled ? 'left-[22px]' : 'left-[2px]'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs opacity-85">
                {r.days.map((d) => DAYS[d].label).join(', ')} · {r.durationMinutes} min
              </p>
              <button
                type="button"
                onClick={() => removeRitual(r.id)}
                className="self-start text-xs font-struct font-semibold underline decoration-2 underline-offset-2 mt-1 focus-ring"
              >
                Delete
              </button>
            </Tile>
          ))}
        </div>
      )}
    </StaggerReveal>
  );
}
