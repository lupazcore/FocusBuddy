import React, { useMemo } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Tile } from '../components/Tile';
import { StaggerReveal } from '../components/StaggerReveal';
import { useStore } from '../store';
import { BUILT_IN_SOUNDS } from '../data/sounds';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function last365Days(): string[] {
  const out: string[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function Streaks() {
  const stats = useStore((s) => s.stats);

  const todayMinutes = useMemo(
    () => stats.days.find((d) => d.date === todayKey())?.minutes ?? 0,
    [stats.days],
  );

  const week = useMemo(() => {
    const keys = last7Days();
    return keys.map((k) => ({ date: k, minutes: stats.days.find((d) => d.date === k)?.minutes ?? 0 }));
  }, [stats.days]);

  const maxWeek = Math.max(1, ...week.map((w) => w.minutes));

  const mostPlayed = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const day of stats.days) {
      for (const [id, count] of Object.entries(day.soundsPlayed)) {
        totals[id] = (totals[id] ?? 0) + count;
      }
    }
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;
    const soundDef = BUILT_IN_SOUNDS.find((s) => s.id === entries[0][0]);
    return soundDef?.name ?? entries[0][0];
  }, [stats.days]);

  const heatmapDays = useMemo(() => {
    const keys = last365Days();
    return keys.map((k) => stats.days.find((d) => d.date === k)?.minutes ?? 0);
  }, [stats.days]);

  const maxHeat = Math.max(1, ...heatmapDays);

  return (
    <StaggerReveal>
      <SectionHeader section="Streaks" title="See what's actually working." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Today" value={`${todayMinutes}`} unit="min"  shadow="hero" bg="bg-gold" />
        <StatTile label="Sessions completed" value={`${stats.sessionCount}`}  />
        <StatTile label="Current streak" value={`${stats.currentStreak}`} unit="days"  bg="bg-leaf" />
        <StatTile label="All-time total" value={`${Math.round(stats.totalMinutes)}`} unit="min"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Tile as="div" pressable={false} shadow="normal" className="p-6">
          <h3 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-4">Last 7 days</h3>
          <div className="flex items-end gap-3 h-28">
            {week.map((w) => (
              <div key={w.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-violet border-2 border-[color:var(--ink)] rounded-t-md"
                  style={{ height: `${(w.minutes / maxWeek) * 90 + 4}px` }}
                  title={`${w.minutes} min`}
                />
                <span className="text-[10px] font-struct opacity-75">
                  {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
                </span>
              </div>
            ))}
          </div>
        </Tile>

        <Tile as="div" pressable={false} shadow="normal" className="p-6 flex flex-col justify-center">
          <h3 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-2">Most-played sound</h3>
          <p className="headline text-3xl">{mostPlayed ?? 'Nothing yet'}</p>
          <p className="text-sm opacity-85 mt-2">
            {mostPlayed ? 'Your go-to background, based on total minutes.' : 'Play a mix and check back here.'}
          </p>
        </Tile>
      </div>

      <Tile as="div" pressable={false} shadow="normal" className="p-6">
        <h3 className="font-struct font-bold text-sm uppercase tracking-wide opacity-85 mb-4">Daily minutes, past year</h3>
        <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto pb-2" style={{ gridAutoColumns: '14px' }}>
          {heatmapDays.map((m, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-[3px] border ${m === 0 ? 'border-[color:color-mix(in_srgb,var(--ink)_35%,transparent)]' : 'border-[color:var(--ink)]'}`}
              style={{
                background: m === 0 ? 'transparent' : `color-mix(in srgb, var(--leaf) ${Math.max(30, Math.min(100, (m / maxHeat) * 100))}%, transparent)`,
              }}
              title={`${m} min`}
            />
          ))}
        </div>
      </Tile>
    </StaggerReveal>
  );
}

function StatTile({
  label,
  value,
  unit,
  shadow = 'normal',
  bg = 'bg-[color:var(--card)]',
}: {
  label: string;
  value: string;
  unit?: string;
  shadow?: 'hero' | 'normal' | 'small';
  bg?: string;
}) {
  return (
    <Tile as="div" pressable={false} shadow={shadow}  className={`p-5 ${bg}`}>
      <p className="text-xs font-struct font-semibold uppercase tracking-wide opacity-85 mb-2">{label}</p>
      <p className="mono-num text-3xl font-bold">
        {value}
        {unit && <span className="text-sm ml-1 opacity-85">{unit}</span>}
      </p>
    </Tile>
  );
}
