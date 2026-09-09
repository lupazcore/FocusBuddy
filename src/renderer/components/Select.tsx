import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

export function Select({ options, value, onChange, className = '' }: { options: SelectOption[], value: string, onChange: (v: string) => void, className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selected = options.find((o) => o.value === value) || options[0];
  const selectedLabel = selected?.label ?? 'Select...';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full border-[3px] border-[color:var(--ink)] ${open ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'} px-4 py-3 font-struct text-sm bg-[color:var(--card)] flex justify-between items-center focus-ring`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      
      {open && (
        <div className="absolute top-full -mt-[3px] left-0 right-0 z-50 grid animate-expandGrid">
          <div className="overflow-hidden min-h-0">
            <div className="box-border border-solid border-[3px] border-t-0 border-[color:var(--ink)] rounded-b-xl rounded-t-none bg-[color:var(--card)] max-h-60 overflow-y-auto overflow-x-hidden flex flex-col">
              {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`w-full text-left px-4 py-2.5 font-struct text-sm transition-colors last:rounded-b-[9px] ${
                  o.value === value ? 'bg-violet text-white font-bold' : 'hover:bg-violet/10'
                }`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
