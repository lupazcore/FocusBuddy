import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'node:path';
import { getMainWindow, forceQuitMainWindow } from './windows';

let tray: Tray | null = null;

export function createTray() {
  const iconPath = path.join(
    app.isPackaged ? process.resourcesPath : app.getAppPath(),
    app.isPackaged ? 'icons' : 'assets/icons',
    process.platform === 'darwin' ? 'tray-iconTemplate.png' : 'tray-icon.png',
  );

  let image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    image = nativeImage.createEmpty();
  }
  if (process.platform === 'darwin') {
    image.setTemplateImage(true);
  }

  tray = new Tray(image);
  tray.setToolTip('Focus Buddy');

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show Focus Buddy',
      click: () => {
        const win = getMainWindow();
        win?.show();
        win?.focus();
      },
    },
    {
      label: 'Play / pause',
      click: () => {
        getMainWindow()?.webContents.send('media:key', 'play-pause');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Focus Buddy',
      click: () => {
        forceQuitMainWindow();
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);

  tray.on('click', () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  return tray;
}
