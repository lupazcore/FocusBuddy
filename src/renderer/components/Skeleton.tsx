import React from 'react';
import type { ScreenId } from './Sidebar';

function SkeletonCard({ children, className = '', animate = true }: { children?: React.ReactNode; className?: string; animate?: boolean }) {
  return (
    <div className={`tile-small border-[3px] border-[color:var(--ink)] rounded-xl p-4 bg-[color:var(--card)] ${animate ? 'animate-pulse' : ''} ${className}`}>
      {children}
    </div>
  );
}

function SkeletonLine({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div className={`border-[2px] border-[color:var(--ink)] rounded-full bg-[color:color-mix(in_srgb,var(--ink)_15%,transparent)] shadow-[2px_2px_0_var(--ink)] ${animate ? 'animate-pulse' : ''} ${className}`} />
  );
}

function SkeletonCircle({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div className={`border-[3px] border-[color:var(--ink)] rounded-full bg-[color:color-mix(in_srgb,var(--ink)_15%,transparent)] shadow-[2px_2px_0_var(--ink)] ${animate ? 'animate-pulse' : ''} ${className}`} />
  );
}

export function ScreenSkeleton({ screen }: { screen: ScreenId }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <SkeletonLine className="w-24 h-4 mb-2" />
          <SkeletonLine className="w-48 h-8" />
        </div>
        <SkeletonLine className="w-32 h-10 rounded-xl" />
      </div>

      {screen === 'mix' || screen === 'den' ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <SkeletonLine className="w-full max-w-sm h-11 rounded-xl" />
            <SkeletonLine className="flex-1 h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} className="h-36 flex flex-col justify-between">
                <div className="flex justify-between">
                  <SkeletonCircle className="w-9 h-9" />
                  <SkeletonCircle className="w-7 h-7" />
                </div>
                <div className="flex justify-between items-end">
                  <SkeletonLine className="w-16 h-4" />
                  <SkeletonLine className="w-8 h-4" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </>
      ) : screen === 'sessions' ? (
        <div className="flex flex-col items-center justify-center mt-12 gap-8">
          <SkeletonCircle className="w-64 h-64 border-[8px]" />
          <SkeletonLine className="w-48 h-6" />
        </div>
      ) : screen === 'settings' ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} className="flex flex-col gap-3">
              <SkeletonLine className="w-32 h-5" />
              <SkeletonLine className="w-full h-3" />
              <SkeletonLine className="w-3/4 h-3" />
            </SkeletonCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} className="flex flex-col gap-3">
              <SkeletonLine className="w-32 h-5" />
              <SkeletonLine className="w-full h-3" />
              <SkeletonLine className="w-3/4 h-3" />
            </SkeletonCard>
          ))}
        </div>
      )}
    </div>
  );
}
