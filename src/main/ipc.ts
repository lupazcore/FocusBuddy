import { ipcMain, dialog, Notification, app, BrowserWindow } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { IPC } from '../shared/ipcChannels';
import type { CustomSound, Settings, Preset, Ritual, Stats, MixData, NowPlayingState } from '../shared/types';
import * as store from './store';
import { customSoundsBase } from './protocol';
import { setAutoStart } from './autostart';
import { registerToggleShortcut } from './globalShortcuts';
import { checkForUpdates } from './updater';
import {
  getMainWindow,
  getMiniPlayerWindow,
  createMiniPlayerWindow,
} from './windows';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.flac', '.aac', '.wma']);

let focusCycleActive = false;

export function registerIpcHandlers() {
  ipcMain.on(IPC.WIN_MINIMIZE, (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
  ipcMain.on(IPC.WIN_MAXIMIZE, (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on(IPC.WIN_CLOSE, (e) => BrowserWindow.fromWebContents(e.sender)?.close());
  ipcMain.handle(IPC.WIN_IS_MAXIMIZED, (e) => BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false);

  ipcMain.handle(IPC.APP_GET_VERSION, () => app.getVersion());
  ipcMain.handle(IPC.APP_GET_PLATFORM, () => process.platform);

  ipcMain.handle(IPC.STORE_GET_SETTINGS, () => store.getSettings());
  ipcMain.handle(IPC.STORE_SET_SETTINGS, (_e, s: Settings) => store.setSettings(s));
  ipcMain.handle(IPC.STORE_GET_PRESETS, () => store.getPresets());
  ipcMain.handle(IPC.STORE_SET_PRESETS, (_e, p: Preset[]) => store.setPresets(p));
  ipcMain.handle(IPC.STORE_GET_RITUALS, () => store.getRituals());
  ipcMain.handle(IPC.STORE_SET_RITUALS, (_e, r: Ritual[]) => store.setRituals(r));
  ipcMain.handle(IPC.STORE_GET_STATS, () => store.getStats());
  ipcMain.handle(IPC.STORE_SET_STATS, (_e, s: Stats) => store.setStats(s));
  ipcMain.handle(IPC.STORE_GET_MIX, () => store.getMix());
  ipcMain.handle(IPC.STORE_SET_MIX, (_e, m: MixData) => store.setMix(m));

  ipcMain.handle(IPC.DIALOG_PICK_AUDIO_FILES, async () => {
    const win = getMainWindow();
    if (!win) return [];
    const result = await dialog.showOpenDialog(win, {
      title: 'Add sounds to The Den',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'flac', 'aac', 'wma'] }],
    });
    return result.canceled ? [] : result.filePaths;
  });

  ipcMain.handle(IPC.SOUND_IMPORT_CUSTOM, async (_e, filePaths: string[]) => {
    const base = customSoundsBase();
    await fs.mkdir(base, { recursive: true });
    const existing = store.getCustomSounds();
    const created: CustomSound[] = [];

    for (const src of filePaths) {
      const ext = path.extname(src).toLowerCase();
      if (!AUDIO_EXTENSIONS.has(ext)) continue;
      const baseName = path.basename(src, ext).replace(/[^\w\- ]/g, '').trim() || 'sound';
      const id = crypto.randomUUID();
      const fileName = `${id}${ext}`;
      const destPath = path.join(base, fileName);
      await fs.copyFile(src, destPath);
      created.push({ id, name: baseName, fileName, importedAt: Date.now() });
    }

    const updated = [...existing, ...created];
    store.setCustomSounds(updated);
    return created;
  });

  ipcMain.handle(IPC.SOUND_GET_CUSTOM_LIST, () => store.getCustomSounds());

  ipcMain.handle(IPC.SOUND_REMOVE_CUSTOM, async (_e, id: string) => {
    const list = store.getCustomSounds();
    const target = list.find((s) => s.id === id);
    if (target) {
      const full = path.join(customSoundsBase(), target.fileName);
      await fs.rm(full, { force: true });
    }
    store.setCustomSounds(list.filter((s) => s.id !== id));
  });

  ipcMain.on(IPC.NOTIFICATION_SHOW, (_e, title: string, body: string) => {
    const settings = store.getSettings();
    if (settings.deepFocusMode && focusCycleActive) return;
    if (!Notification.isSupported()) return;
    new Notification({ title, body, silent: true }).show();
  });

  ipcMain.handle(IPC.AUTOSTART_SET, (_e, enabled: boolean) => setAutoStart(enabled));

  ipcMain.handle(IPC.SHORTCUT_SET, (_e, accelerator: string) => {
    const ok = registerToggleShortcut(accelerator, getMainWindow);
    if (ok) {
      const s = store.getSettings();
      store.setSettings({ ...s, globalShortcut: accelerator });
    }
    return ok;
  });

  ipcMain.on(IPC.UPDATE_CHECK, () => checkForUpdates());

  ipcMain.on(IPC.MINIPLAYER_OPEN, () => createMiniPlayerWindow());
  ipcMain.on(IPC.MINIPLAYER_PUSH_STATE, (_e, state: NowPlayingState) => {
    getMiniPlayerWindow()?.webContents.send(IPC.MINIPLAYER_STATE_EVENT, state);
  });
  ipcMain.on(IPC.MINIPLAYER_COMMAND, (_e, cmd: 'toggle-play' | 'stop' | 'request-state') => {
    getMainWindow()?.webContents.send(IPC.MINIPLAYER_COMMAND_EVENT, cmd);
  });

  ipcMain.on(IPC.SESSION_SET_ACTIVE, (_e, active: boolean) => {
    focusCycleActive = active;
  });
}
