import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';
import { IPC } from '../shared/ipcChannels';
import type { UpdateStatus } from '../shared/types';

autoUpdater.autoDownload = false;

let resolveWindow: (() => BrowserWindow | null) | null = null;

function send(win: BrowserWindow | null, status: UpdateStatus) {
  win?.webContents.send(IPC.UPDATE_STATUS_EVENT, status);
}

export function wireUpdater(getWindow: () => BrowserWindow | null) {
  resolveWindow = getWindow;
  autoUpdater.on('checking-for-update', () => send(getWindow(), { state: 'checking' }));
  autoUpdater.on('update-available', () => send(getWindow(), { state: 'available' }));
  autoUpdater.on('update-not-available', () => send(getWindow(), { state: 'not-available' }));
  autoUpdater.on('error', (err) => send(getWindow(), { state: 'error', message: String(err?.message ?? err) }));
  autoUpdater.on('update-downloaded', () => send(getWindow(), { state: 'downloaded' }));
}

export function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(() => {
    // Dev/unpacked fallback so the UI still reacts.
    if (resolveWindow) send(resolveWindow(), { state: 'not-available' });
  });
}

export function checkForUpdatesQuiet() {
  autoUpdater.checkForUpdates().catch(() => undefined);
}
