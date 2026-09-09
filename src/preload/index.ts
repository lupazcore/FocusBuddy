import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipcChannels';
import type { FocusBuddyAPI, NowPlayingState, UpdateStatus } from '../shared/types';

function on(channel: string, cb: (...args: any[]) => void) {
  const listener = (_e: Electron.IpcRendererEvent, ...args: any[]) => cb(...args);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api: FocusBuddyAPI = {
  window: {
    minimize: () => ipcRenderer.send(IPC.WIN_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC.WIN_MAXIMIZE),
    close: () => ipcRenderer.send(IPC.WIN_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC.WIN_IS_MAXIMIZED),
  },
  app: {
    getVersion: () => ipcRenderer.invoke(IPC.APP_GET_VERSION),
    getPlatform: () => ipcRenderer.invoke(IPC.APP_GET_PLATFORM),
  },
  store: {
    getSettings: () => ipcRenderer.invoke(IPC.STORE_GET_SETTINGS),
    setSettings: (s) => ipcRenderer.invoke(IPC.STORE_SET_SETTINGS, s),
    getPresets: () => ipcRenderer.invoke(IPC.STORE_GET_PRESETS),
    setPresets: (p) => ipcRenderer.invoke(IPC.STORE_SET_PRESETS, p),
    getRituals: () => ipcRenderer.invoke(IPC.STORE_GET_RITUALS),
    setRituals: (r) => ipcRenderer.invoke(IPC.STORE_SET_RITUALS, r),
    getStats: () => ipcRenderer.invoke(IPC.STORE_GET_STATS),
    setStats: (s) => ipcRenderer.invoke(IPC.STORE_SET_STATS, s),
    getMix: () => ipcRenderer.invoke(IPC.STORE_GET_MIX),
    setMix: (m) => ipcRenderer.invoke(IPC.STORE_SET_MIX, m),
  },
  dialog: {
    pickAudioFiles: () => ipcRenderer.invoke(IPC.DIALOG_PICK_AUDIO_FILES),
  },
  sounds: {
    importCustom: (filePaths) => ipcRenderer.invoke(IPC.SOUND_IMPORT_CUSTOM, filePaths),
    getCustomList: () => ipcRenderer.invoke(IPC.SOUND_GET_CUSTOM_LIST),
    removeCustom: (id) => ipcRenderer.invoke(IPC.SOUND_REMOVE_CUSTOM, id),
    builtInUrl: (fileName) => `fb-sound://built-in/${encodeURIComponent(fileName)}`,
    customUrl: (fileName) => `fb-sound://custom/${encodeURIComponent(fileName)}`,
  },
  notifications: {
    show: (title, body) => ipcRenderer.send(IPC.NOTIFICATION_SHOW, title, body),
  },
  autostart: {
    set: (enabled) => ipcRenderer.invoke(IPC.AUTOSTART_SET, enabled),
  },
  shortcuts: {
    set: (accelerator) => ipcRenderer.invoke(IPC.SHORTCUT_SET, accelerator),
    onTriggered: (cb) => on(IPC.SHORTCUT_TRIGGERED_EVENT, cb),
  },
  updates: {
    check: () => ipcRenderer.send(IPC.UPDATE_CHECK),
    onStatus: (cb) => on(IPC.UPDATE_STATUS_EVENT, (s: UpdateStatus) => cb(s)),
  },
  miniPlayer: {
    open: () => ipcRenderer.send(IPC.MINIPLAYER_OPEN),
    pushState: (state) => ipcRenderer.send(IPC.MINIPLAYER_PUSH_STATE, state),
    onState: (cb) => on(IPC.MINIPLAYER_STATE_EVENT, (s: NowPlayingState) => cb(s)),
    sendCommand: (cmd) => ipcRenderer.send(IPC.MINIPLAYER_COMMAND, cmd),
    onCommand: (cb) => on(IPC.MINIPLAYER_COMMAND_EVENT, cb),
  },
  media: {
    onKey: (cb) => on(IPC.MEDIA_KEY_EVENT, cb),
  },
  session: {
    setActive: (active) => ipcRenderer.send(IPC.SESSION_SET_ACTIVE, active),
  },
};

contextBridge.exposeInMainWorld('focusBuddy', api);
