import { globalShortcut, BrowserWindow } from 'electron';
import { IPC } from '../shared/ipcChannels';

let currentAccelerator: string | null = null;

export function registerToggleShortcut(accelerator: string, getWindow: () => BrowserWindow | null): boolean {
  unregisterToggleShortcut();
  try {
    const ok = globalShortcut.register(accelerator, () => {
      const win = getWindow();
      if (!win) return;
      win.webContents.send(IPC.SHORTCUT_TRIGGERED_EVENT);
    });
    if (ok) currentAccelerator = accelerator;
    return ok;
  } catch {
    return false;
  }
}

export function unregisterToggleShortcut() {
  if (currentAccelerator) {
    globalShortcut.unregister(currentAccelerator);
    currentAccelerator = null;
  }
}

export function registerMediaKeys(getWindow: () => BrowserWindow | null) {
  try {
    globalShortcut.register('MediaPlayPause', () => {
      getWindow()?.webContents.send(IPC.MEDIA_KEY_EVENT, 'play-pause');
    });
  } catch {
    /* not available on this platform/hardware, non-fatal */
  }
}

export function unregisterAll() {
  globalShortcut.unregisterAll();
  currentAccelerator = null;
}
