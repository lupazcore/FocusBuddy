import { protocol, net, app } from 'electron';
import path from 'node:path';

const SOUND_PROTOCOL = 'fb-sound';

/** Must run before app.whenReady(). */
export function registerSoundProtocolPrivileges() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: SOUND_PROTOCOL,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
        bypassCSP: false,
      },
    },
  ]);
}

function builtInBase(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'sounds')
    : path.join(app.getAppPath(), 'assets', 'sounds');
}

export function customSoundsBase(): string {
  return path.join(app.getPath('userData'), 'customSounds');
}

/** Must run after app.whenReady(). */
export function registerSoundProtocolHandler() {
  protocol.handle(SOUND_PROTOCOL, (request) => {
    try {
      const url = new URL(request.url);
      const kind = url.hostname; // 'built-in' | 'custom'
      const relPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const base = kind === 'custom' ? customSoundsBase() : builtInBase();
      const full = path.normalize(path.join(base, relPath));
      const safeBase = path.normalize(base + path.sep);
      if (!full.startsWith(safeBase)) {
        return new Response('Forbidden', { status: 403 });
      }
      return net.fetch(`file://${full}`);
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }
  });
}
