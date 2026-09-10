import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Tile } from '../components/Tile';
import { StaggerReveal } from '../components/StaggerReveal';
import { useStore } from '../store';
import type { LivingMixIntensity } from '@shared/types';

const INTENSITIES: { id: LivingMixIntensity; label: string }[] = [
  { id: 'subtle', label: 'Subtle' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'lively', label: 'Lively' },
];

const WIND_DOWN_PRESETS = [30, 45, 60];

import { useEffect } from 'react';

function useStickyNumber(key: string, defaultValue: number) {
  const [value, setValue] = useState(() => {
    const saved = window.localStorage.getItem(key);
    return saved !== null ? Number(saved) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);
  return [value, setValue] as const;
}

export function Sessions() {
  const phase = useStore((s) => s.phase);
  const endsAt = useStore((s) => s.endsAt);
  const now = useStore((s) => s.now);
  const startFocusCycle = useStore((s) => s.startFocusCycle);
  const startWindDown = useStore((s) => s.startWindDown);
  const stopSession = useStore((s) => s.stopSession);
  const livingMixEnabled = useStore((s) => s.livingMixEnabled);
  const livingMixIntensity = useStore((s) => s.livingMixIntensity);
  const setLivingMix = useStore((s) => s.setLivingMix);

  const [workMinutes, setWorkMinutes] = useStickyNumber('fb_work_min', 25);
  const [breakMinutes, setBreakMinutes] = useStickyNumber('fb_break_min', 5);
  const [windDownMinutes, setWindDownMinutes] = useStickyNumber('fb_winddown_min', 30);
  const [customWindDown, setCustomWindDown] = useState('');

  const remaining = endsAt ? Math.max(0, Math.round((endsAt - now) / 1000)) : null;
  const mm = remaining !== null ? String(Math.floor(remaining / 60)).padStart(2, '0') : '--';
  const ss = remaining !== null ? String(remaining % 60).padStart(2, '0') : '--';

  const phaseLabel =
    phase === 'focus-work'
      ? 'Focus stretch'
      : phase === 'focus-break'
      ? 'Break'
      : phase === 'wind-down'
      ? 'Winding down'
      : 'Nothing running';

  return (
    <StaggerReveal>
      <SectionHeader section="Sessions" title="Pick a session, we'll keep time." />

      <Tile as="div" shadow="hero" pressable={false}  className="mb-6 p-6 bg-violet text-white">
        <p className="kicker text-white/70">CURRENT SESSION</p>
        <div className="flex items-end justify-between mt-2 flex-wrap gap-4">
          <div>
            <p className="font-struct font-bold text-lg">{phaseLabel}</p>
            {phase === 'idle' ? (
              <p className="text-sm text-white/70 mt-1">Start a focus cycle or wind-down timer below.</p>
            ) : (
              <p className="text-sm text-white/70 mt-1">Focus Buddy will fade the mix and let you know.</p>
            )}
          </div>
          <p className="mono-num text-5xl font-bold">
            {mm}:{ss}
          </p>
        </div>
        {phase !== 'idle' && (
          <button
            type="button"
            onClick={stopSession}
            className="mt-4 bg-[color:var(--ink)] text-[color:var(--paper)] font-struct font-semibold text-sm px-4 py-2 rounded-xl border-[3px] border-white/40 shadow-small tile-pressable focus-ring"
          >
            Stop session
          </button>
        )}
      </Tile>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Tile as="div" shadow="normal" pressable={false}  className="p-6 bg-violet text-white">
          <p className="kicker text-white/70">FOCUS CYCLE</p>
          <h3 className="headline text-2xl mt-1 mb-4">Work, then breathe.</h3>
          <div className="flex gap-6 mb-5">
            <NumberPicker label="Work minutes" value={workMinutes} onChange={setWorkMinutes} min={1} max={90} step={1} />
            <NumberPicker label="Break minutes" value={breakMinutes} onChange={setBreakMinutes} min={1} max={30} step={1} />
          </div>
          <button
            type="button"
            onClick={() => startFocusCycle(workMinutes, breakMinutes)}
            className="bg-gold text-black font-struct font-bold text-sm px-5 py-3 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
          >
            Start focus cycle
          </button>
        </Tile>

        <Tile as="div" shadow="normal" pressable={false}  className="p-6 bg-violet text-white">
          <p className="kicker text-white/70">WIND-DOWN TIMER</p>
          <h3 className="headline text-2xl mt-1 mb-4">Ease into sleep.</h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            {WIND_DOWN_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setWindDownMinutes(m);
                  setCustomWindDown('');
                }}
                className={`px-4 py-2 rounded-xl border-[3px] border-[color:var(--ink)] font-struct font-semibold text-sm tile-pressable focus-ring ${
                  windDownMinutes === m && !customWindDown ? 'bg-gold text-black' : 'bg-white/10 text-white'
                }`}
              >
                {m} min
              </button>
            ))}
            <input
              value={customWindDown}
              onChange={(e) => {
                setCustomWindDown(e.target.value);
                const n = Number(e.target.value);
                if (n > 0) setWindDownMinutes(n);
              }}
              placeholder="Custom"
              inputMode="numeric"
              className="w-20 px-3 py-2 rounded-xl border-[3px] border-[color:var(--ink)] font-struct text-sm text-black focus-ring"
            />
          </div>
          <button
            type="button"
            onClick={() => startWindDown(windDownMinutes)}
            className="bg-gold text-black font-struct font-bold text-sm px-5 py-3 rounded-xl border-[3px] border-[color:var(--ink)] shadow-small tile-pressable focus-ring"
          >
            Start wind-down
          </button>
        </Tile>
      </div>

      <Tile as="div" shadow="small" pressable={false} className="p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="max-w-md">
            <h3 className="font-struct font-bold text-base mb-1">Living Mix</h3>
            <p className="text-sm opacity-85">
              Lets rain intensity and fire crackle drift naturally instead of looping flat.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={livingMixEnabled}
            onClick={() => setLivingMix(!livingMixEnabled, livingMixIntensity)}
            className={`w-14 h-8 rounded-full border-[3px] border-ink relative tile-pressable focus-ring ${
              livingMixEnabled ? 'bg-leaf' : 'bg-[color:var(--card)]'
            }`}
          >
            <span
              className={`absolute top-[1.5px] w-6 h-6 rounded-full bg-ink transition-all ${
                livingMixEnabled ? 'left-[25.5px]' : 'left-[1.5px]'
              }`}
            />
          </button>
        </div>
        {livingMixEnabled && (
          <div className="flex gap-2 mt-4">
            {INTENSITIES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLivingMix(true, opt.id)}
                className={`px-4 py-2 rounded-xl border-[3px] border-[color:var(--ink)] font-struct font-semibold text-sm tile-pressable focus-ring ${
                  livingMixIntensity === opt.id ? 'bg-leaf' : 'bg-[color:var(--card)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </Tile>
    </StaggerReveal>
  );
}

function NumberPicker({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <p className="text-xs font-struct font-semibold uppercase tracking-wide text-white/70 mb-1.5">{label}</p>
      <div className="flex items-center gap-2 border-[3px] border-[color:var(--ink)] rounded-xl bg-white/10 px-2 py-1.5">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-7 h-7 rounded-lg border-2 border-[color:var(--ink)] bg-gold text-black font-bold focus-ring"
        >
          −
        </button>
        <span className="mono-num w-10 text-center font-bold">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-7 h-7 rounded-lg border-2 border-[color:var(--ink)] bg-gold text-black font-bold focus-ring"
        >
          +
        </button>
      </div>
    </div>
  );
}
