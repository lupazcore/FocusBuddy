import { app } from 'electron';

export function getAutoStart(): boolean {
  if (process.platform === 'linux') return false;
  return app.getLoginItemSettings().openAtLogin;
}

export function setAutoStart(enabled: boolean): boolean {
  if (process.platform === 'linux') return false;
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: true,
    args: enabled ? ['--hidden'] : [],
  });
  return app.getLoginItemSettings().openAtLogin;
}
