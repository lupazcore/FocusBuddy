import React, { useEffect, useState } from 'react';
import { CloseIcon, MinimizeIcon, MaximizeIcon } from './icons/NavIcons';

export function TitleBar({ platform }: { platform: NodeJS.Platform | null }) {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    window.focusBuddy?.window.isMaximized().then(setMaximized);
  }, []);

  if (platform === 'darwin') {
    return <div className="drag-region h-9 w-full" />;
  }

  return (
    <div className="drag-region h-9 w-full flex items-center justify-between bg-[color:var(--paper)] border-b-[3px] border-[color:var(--ink)]">
      <div className="pl-4 flex items-center">
        <span className="font-struct font-bold text-sm opacity-90">Focus Buddy</span>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          className="no-drag w-11 h-9 flex items-center justify-center hover:bg-black/10 focus-ring"
          aria-label="Minimize window"
          onClick={() => window.focusBuddy?.window.minimize()}
        >
          <MinimizeIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="no-drag w-11 h-9 flex items-center justify-center hover:bg-black/10 focus-ring"
          aria-label="Maximize window"
          onClick={() => {
            window.focusBuddy?.window.maximize();
            setMaximized((m) => !m);
          }}
        >
          <MaximizeIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="no-drag w-11 h-9 flex items-center justify-center hover:bg-red-500 hover:text-white focus-ring"
          aria-label="Close window"
          onClick={() => window.focusBuddy?.window.close()}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
