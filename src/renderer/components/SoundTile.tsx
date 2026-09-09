import React, { useRef, useState, useEffect } from 'react';
import type { SoundDef } from '@shared/types';
import { SoundIcon } from './icons/SoundIcons';
import { StarIcon } from './icons/NavIcons';

interface SoundTileProps {
  sound: SoundDef;
  level: number;
  isPlaying: boolean;
  isFavorite: boolean;
  onLevelChange: (percent: number) => void;
  onToggleFavorite: () => void;
  index?: number;
  firstLaunch?: boolean;
}

const accentBg: Record<string, string> = {
  leaf: 'var(--leaf)',
  gold: 'var(--gold)',
};

export function SoundTile({
  sound,
  level,
  isPlaying,
  isFavorite,
  onLevelChange,
  onToggleFavorite,
  index = 0,
  firstLaunch = false,
}: SoundTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startLevel: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const levelRef = useRef(level);
  levelRef.current = level;

  // React attaches its synthetic onWheel listener as passive, so
  // preventDefault() inside it is silently ignored (and warns in the
  // console) and the page scrolls along with the tile. A real, manually
  // attached listener with { passive: false } is required to actually
  // stop that.
  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -4 : 4;
      onLevelChange(clamp(levelRef.current + delta));
    };
    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, [onLevelChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-star]')) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startLevel: level };
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dy = dragState.current.startY - e.clientY;
    const next = clamp(dragState.current.startLevel + dy * 0.6);
    onLevelChange(next);
  };

  const handlePointerUp = () => {
    dragState.current = null;
    setDragging(false);
  };

  const accent = accentBg[sound.family];

  return (
    <div
      ref={tileRef}
      role="button"
      tabIndex={0}
      aria-label={`${sound.name}, ${level} percent. Scroll or drag vertically to change level.`}
      className={`group tile-base tile-normal focus-ring relative overflow-hidden text-left p-0 h-36 select-none transition-colors hover:border-[color:var(--gold)] ${
        isPlaying ? 'animate-breathe' : ''
      } ${firstLaunch ? 'animate-popIn' : ''}`}
      style={{
        animationDelay: firstLaunch ? `${index * 35}ms` : undefined,
        cursor: dragging ? 'ns-resize' : 'pointer',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="absolute left-0 right-0 bottom-0 transition-[height] duration-150 ease-out"
        style={{ height: `${level}%`, background: accent, opacity: 0.55 }}
        aria-hidden
      />
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full border-[3px] border-[color:var(--ink)] flex items-center justify-center bg-[color:var(--card)] transition-colors group-hover:border-[color:var(--gold)]">
            <SoundIcon id={sound.icon} className="w-5 h-5" />
          </div>
          <button
            type="button"
            data-star
            aria-label={isFavorite ? `Remove ${sound.name} from favorites` : `Add ${sound.name} to favorites`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[color:color-mix(in_srgb,var(--ink)_10%,transparent)]"
          >
            <StarIcon filled={isFavorite} className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-end justify-between">
          <p className="font-struct font-semibold text-sm leading-tight">{sound.name}</p>
          <span className="mono-num text-xs bg-[color:var(--card)] border-2 border-[color:var(--ink)] rounded-md px-1.5 py-0.5 transition-colors group-hover:border-[color:var(--gold)]">
            {Math.round(level)}%
          </span>
        </div>
      </div>
    </div>
  );
}
