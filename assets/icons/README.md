# Focus Buddy icons

- `icon.svg` - full-color app icon master. Source of truth for all `.ico`, `.icns`, and `.png` files (including the system tray and macOS template).
- `generate-icons.mjs`: run via `npm run icons` to rasterize the SVGs above into every binary format electron-builder needs (`icon.ico`, `icon.icns`, `png/*.png`, `tray-icon.png`, `tray-iconTemplate.png`). These generated binaries are intentionally **not** committed (see `.gitignore`). Generate them locally before you build/package.
- `lupaz-mascot.png`: **optional**. If you have the real shared Lupaz sidebar-footer badge asset, drop it here under this exact filename and the app will use it pixel-identical to this developer's other apps. If it's absent, `LupazBadge.tsx` falls back to an equivalent vector drawing automatically, so the app still builds and looks correct without it.

## Regenerating

```bash
npm install
npm run icons
```

Then verify:
- `icon.ico` shows a crisp mark at 16×16 and 32×32 (check in Windows Explorer's small-icon view).
- `icon.icns` looks correct in macOS Finder at both list and gallery sizes.
- `png/icon16.png` through `png/icon1024.png` all exist for Linux desktop entries.
