// Electron pinned to 43.x because 44+ dropped ia32 prebuilts.
// Focus Buddy still ships a 32-bit Windows installer.
import { app, BrowserWindow, session } from 'electron';
import {
  createMainWindow,
  getMainWindow,
  forceQuitMainWindow,
  closeMiniPlayerWindow,
} from './windows';
import { createTray } from './tray';
import { buildAppMenu } from './menu';
import { registerIpcHandlers } from './ipc';
import { registerSoundProtocolPrivileges, registerSoundProtocolHandler } from './protocol';
import { registerToggleShortcut, registerMediaKeys, unregisterAll } from './globalShortcuts';
import { wireUpdater, checkForUpdatesQuiet } from './updater';
import { getSettings } from './store';

const isDev = process.env.NODE_ENV === 'development';

registerSoundProtocolPrivileges();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.setAlwaysOnTop(true);
      win.show();
      win.setAlwaysOnTop(false);
      win.focus();
    }
  });

  app.whenReady().then(() => {
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.lupazcore.focusbuddy');
    }
    
    registerSoundProtocolHandler();
    buildAppMenu();

    session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));
    app.on('web-contents-created', (_e, contents) => {
      contents.on('will-navigate', (navEvent) => navEvent.preventDefault());
      contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    });

    const win = createMainWindow();
    createTray();
    registerIpcHandlers();
    wireUpdater(getMainWindow);

    const settings = getSettings();
    registerToggleShortcut(settings.globalShortcut, getMainWindow);
    registerMediaKeys(getMainWindow);

    if (!isDev && settings.autoUpdateEnabled) {
      setTimeout(() => checkForUpdatesQuiet(), 4000);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      } else {
        if (win.isMinimized()) win.restore();
        win.setAlwaysOnTop(true);
        win.show();
        win.setAlwaysOnTop(false);
        win.focus();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    forceQuitMainWindow();
    closeMiniPlayerWindow();
    unregisterAll();
  });
}
