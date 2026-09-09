import React from 'react';

/**
 * Shared cross-app footer badge. If assets/icons/lupaz-mascot.png is present
 * it is used verbatim (kept pixel-identical across this developer's apps);
 * otherwise this vector fallback renders an equivalent mark.
 */
export function LupazBadge({ version }: { version: string }) {
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <div className="mt-auto px-3 pb-4 pt-3 overflow-x-hidden">
      <div className="rounded-badge border-[3px] border-[color:var(--ink)] bg-gold shadow-small p-3 flex flex-col items-center gap-2 w-full max-h-[48px] group-hover:max-h-[140px] transition-[max-height] duration-300 overflow-hidden">
        {!imgFailed ? (
          <img
            src="../../assets/icons/lupaz-mascot.png"
            alt="Lupaz"
            className="w-6 h-6 group-hover:w-12 group-hover:h-12 transition-all duration-300 object-contain shrink-0"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-6 h-6 group-hover:w-12 group-hover:h-12 transition-all duration-300 shrink-0">
            <FallbackMascot />
          </div>
        )}
        <p className="text-[9px] font-struct font-bold tracking-[0.18em] uppercase text-black/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ~Made by lupazcore~
        </p>
        <p className="text-[9px] font-mono text-black/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          v{version}
        </p>
      </div>
    </div>
  );
}

function FallbackMascot() {
  return (
    <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="36" height="14" rx="4" fill="#16171A" />
      <text x="24" y="14" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="7" fill="#F0B429">
        LUPAZ
      </text>
      <circle cx="24" cy="32" r="4" fill="#16171A" />
      <path d="M14 46c0-7 4-12 10-12s10 5 10 12" stroke="#16171A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
