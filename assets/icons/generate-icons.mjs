#!/usr/bin/env node
/**
 * Generates .ico / .icns / PNG sets from the SVG masters in this folder.
 *
 * Run with: npm run icons
 *
 * This uses `icon-gen`, which rasterizes SVG -> PNG at each required size
 * and packs platform containers. It needs a system-available Chromium/Cairo
 * rasterizer under the hood (bundled with icon-gen's dependencies), so run
 * it locally before packaging rather than relying on it inside minimal CI
 * containers without graphics libs. The GitHub Actions workflow in this
 * repo runs on windows-latest/macos-latest/ubuntu-latest images, which all
 * have what's needed.
 */
import iconGen from 'icon-gen';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;
const pngDir = path.join(outDir, 'png');

/**
 * icon-gen's `favicon` mode always packs an ICO alongside the PNGs, even
 * when `icoSizes: []` is passed, it silently falls back to its own
 * REQUIRED_ICO_SIZES ([16, 24, 32, 48, 64]) instead of skipping ICO
 * generation. If none of those sizes were actually rasterized (which is
 * the case for our small tray-only PNG sets), it throws mid-write, and its
 * own cleanup-on-error path then tries to delete a file that was never
 * created, surfacing a confusing "ENOENT: unlink" instead of the real
 * cause. There is no supported way to fully disable that ICO step, so we
 * work around it: pad the requested sizes with the sizes it needs so it
 * doesn't crash, generate into a scratch directory, then keep only the
 * PNG names we actually want and discard the rest (including the unwanted
 * favicon.ico this mode always produces).
 */
const ICO_SAFE_SIZES = [16, 24, 32, 48, 64];

async function generatePngOnly(svgPath, name, wantedSizes) {
  const scratch = fs.mkdtempSync(path.join(outDir, '.icon-scratch-'));
  try {
    const pngSizes = Array.from(new Set([...wantedSizes, ...ICO_SAFE_SIZES])).sort((a, b) => a - b);
    await iconGen(svgPath, scratch, {
      report: true,
      favicon: { name, pngSizes, icoSizes: [] },
    });
    // Electron prefers standard base name and @2x suffix
    const baseSize = wantedSizes[0];
    const doubleSize = wantedSizes.find(s => s === baseSize * 2);
    const tripleSize = wantedSizes.find(s => s === baseSize * 3);

    fs.copyFileSync(path.join(scratch, `${name}${baseSize}.png`), path.join(outDir, `${name}.png`));
    if (doubleSize) {
      fs.copyFileSync(path.join(scratch, `${name}${doubleSize}.png`), path.join(outDir, `${name}@2x.png`));
    }
    if (tripleSize) {
      fs.copyFileSync(path.join(scratch, `${name}${tripleSize}.png`), path.join(outDir, `${name}@3x.png`));
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

async function main() {
  fs.mkdirSync(pngDir, { recursive: true });

  const iconSvg = path.join(outDir, 'icon.svg');


  console.log('Generating Windows .ico...');
  await iconGen(iconSvg, outDir, {
    report: true,
    ico: { name: 'icon', sizes: [16, 32, 48, 256] },
  });

  console.log('Generating macOS .icns...');
  await iconGen(iconSvg, outDir, {
    report: true,
    icns: { name: 'icon', sizes: [16, 32, 64, 128, 256, 512, 1024] },
  });

  console.log('Generating Linux PNG set...');
  await iconGen(iconSvg, pngDir, {
    report: true,
    favicon: {
      name: 'icon',
      pngSizes: [16, 24, 32, 48, 64, 96, 128, 192, 256, 512, 1024],
      icoSizes: [],
    },
  });

  console.log('Generating macOS dark-menu-bar template PNG (tray-iconTemplate.png)...');
  await generatePngOnly(iconSvg, 'tray-iconTemplate', [22, 44]);

  console.log('Generating cross-platform tray icon PNG...');
  await generatePngOnly(iconSvg, 'tray-icon', [16, 24, 32, 48]);

  console.log('Done. Review assets/icons/icon.ico, icon.icns, png/, tray-icon.png, tray-iconTemplate.png.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
