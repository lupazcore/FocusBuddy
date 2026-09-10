import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { getSettings } from './store';

let mainWindow: BrowserWindow | null = null;
let miniPlayerWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';
const RENDERER_DEV_URL = 'http://localhost:5173';
const RENDERER_PROD_FILE = path.join(__dirname, '..', 'renderer', 'index.html');
const APP_ICON = path.join(__dirname, '..', '..', 'assets', 'icons', 'icon.ico');

function backgroundColorFor(theme: string): string {
  return theme === 'dark' ? '#1E2024' : '#F5F2E6';
}

export function getMainWindow() {
  return mainWindow;
}
export function getMiniPlayerWindow() {
  return miniPlayerWindow;
}

export function createMainWindow(): BrowserWindow {
  const settings = getSettings();
  const isAutoStart = process.argv.includes('--hidden');
  const startHidden = isAutoStart && settings.launchMinimized;

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    show: !startHidden,
    icon: APP_ICON,
    backgroundColor: backgroundColorFor(settings.theme),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    trafficLightPosition: { x: 18, y: 18 },
    frame: process.platform === 'darwin',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  if (isDev) {
    win.loadURL(RENDERER_DEV_URL);
    // The custom (frameless) window has no native menu on Windows/Linux,
    // and the default Ctrl+Shift+I / F12 DevTools shortcut is normally
    // wired up through that native menu. With no menu, that shortcut does
    // nothing. Rather than depend on a keyboard shortcut at all, just
    // always open DevTools automatically in development.
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(RENDERER_PROD_FILE);
  }

  win.once('ready-to-show', () => {
    if (win.isVisible()) {
      win.setAlwaysOnTop(true);
      win.setAlwaysOnTop(false);
      win.focus();
    }
  });

  win.on('close', (e) => {
    const s = getSettings();
    if (s.keepPlayingOnClose && !(win as any).__forceQuit) {
      e.preventDefault();
      win.hide();
    }
  });


  mainWindow = win;
  return win;
}

export function forceQuitMainWindow() {
  if (mainWindow) {
    (mainWindow as any).__forceQuit = true;
    mainWindow.close();
  }
}

export function createMiniPlayerWindow(): BrowserWindow {
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.show();
    miniPlayerWindow.focus();
    return miniPlayerWindow;
  }

  const display = screen.getPrimaryDisplay();

  const win = new BrowserWindow({
    width: 260,
    height: 120,
    x: display.workArea.x + display.workArea.width - 280,
    y: display.workArea.y + 24,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    // The card itself draws its own rounded corners + border in CSS. Windows
    // rounds every app window's corners by default, using its own generic
    // small radius rather than ours, which clipped this tightly-fit window
    // into a mismatched shape. Disable that so only the CSS radius applies.
    roundedCorners: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');

  const query = '?miniplayer=1';
  if (isDev) {
    win.loadURL(RENDERER_DEV_URL + '/' + query);
  } else {
    win.loadFile(RENDERER_PROD_FILE, { search: query });
  }

  win.on('closed', () => {
    miniPlayerWindow = null;
  });

  miniPlayerWindow = win;
  return win;
}

export function closeMiniPlayerWindow() {
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.close();
  }
}
