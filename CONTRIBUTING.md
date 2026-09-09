# Contributing to Focus Buddy

Thanks for considering a contribution. Focus Buddy is a free, open-source project and outside help is welcome, whether that's a bug fix, a new built-in sound (with clean licensing), a translation, or a packaging improvement.

## Getting set up

```bash
git clone https://github.com/user/focus-buddy.git
cd focus-buddy
npm install
npm run icons      # generates icon binaries from assets/icons/*.svg
npm run dev        # starts the app in development mode
```

The built-in sounds are already bundled in `assets/sounds/`. There is nothing to source or set up before running.

## Project structure, in brief

- `src/main/`: Electron main process: windows, tray, IPC handlers, autostart, global shortcuts, the updater.
- `src/preload/`: the one place allowed to bridge main ↔ renderer, via a typed `contextBridge` API (`window.focusBuddy`).
- `src/renderer/`: the React + TypeScript UI. One component per bento tile, screens under `src/renderer/screens/`, shared state in `src/renderer/store/` (Zustand).
- `src/renderer/audio/AudioEngine.ts`: the Web Audio wrapper. Please route all playback/fades through this class rather than adding raw `<audio>` tags or ad hoc `GainNode`s elsewhere.
- `src/shared/`: types and IPC channel names used by both main and renderer, so the two stay in sync.

## Where the design tokens live

Focus Buddy follows a specific "playful neo-brutalism bento" visual language (thick borders, hard offset shadows, no blur, three flat accents, Fraunces/Space Grotesk/Space Mono typography). To keep contributions on-brand:

- **Color tokens**: `src/renderer/index.css` (the `:root` and `.dark` blocks) and mirrored in `tailwind.config.cjs` under `theme.extend.colors`.
- **Shadows, radii, animation timing**: `tailwind.config.cjs` under `theme.extend.boxShadow`, `borderRadius`, and `keyframes`/`animation`.
- **Fonts**: loaded in `src/renderer/index.css` via the Google Fonts `@import`, mapped to Tailwind font families in `tailwind.config.cjs` under `theme.extend.fontFamily`.
- **The reusable `Tile` primitive**: `src/renderer/components/Tile.tsx`: new bento tiles should be built from this rather than styled from scratch, so shadow/press/rotation behavior stays consistent.

Please don't introduce soft/blurred shadows, gradients, or a fourth accent color without discussing it in an issue first. The flat, hard-edged look is a deliberate, load-bearing part of the design.

## Adding a new built-in sound

1. Source or record a clean, loop-friendly audio file. It must be either your own original recording (released under CC0 or an equivalent permissive license) or sourced from a legitimately royalty-free/CC0 library (Freesound.org filtered to CC0 results, Pixabay Audio, etc.). Never port a sound file from another app.
2. Add a matching entry to `assets/sounds/LICENSES.md` with real provenance, not placeholder text.
3. Register the sound's id/name/family/icon in `src/renderer/data/sounds.ts` (`BUILT_IN_SOUNDS` and `SOUND_FILE_MAP`).
4. Add a matching icon in `src/renderer/components/icons/SoundIcons.tsx`: single-weight, 2.5px stroke, rounded caps, chunky and recognizable at small sizes, consistent with the existing set.

## Branch and PR expectations

- Branch from `main`, name branches descriptively (`fix/tray-icon-wayland`, `feature/pink-noise-icon`).
- Keep PRs focused. One feature or fix per PR is much easier to review than a grab-bag.
- Run `npm run lint` before opening a PR.
- If you touch the audio engine or session/timer logic, please describe how you tested it manually (timers are inherently a little annoying to unit test end-to-end).
- If your change is visual, a before/after screenshot in the PR description is appreciated.
- Be kind in review threads. This is a hobby-scale open-source project, not a company.

## Reporting bugs / requesting features

Open an issue with:
- Your OS and Focus Buddy version (Settings → About).
- Steps to reproduce, if it's a bug.
- What you expected vs. what happened.

## Code of conduct

Be respectful, assume good faith, and keep discussion focused on the project. That's it.
