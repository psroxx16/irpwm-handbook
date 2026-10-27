# IRPWM Handbook — app

Plain-language, offline handbook of the **Indian Railways Permanent Way Manual (2024 reprint, corrected up to ACS-16)**: all 15 chapters, 12 field calculators, key-values table, glossary and quizzes.

| Platform | How to get it |
|---|---|
| **Any device (web app)** | `https://<owner>.github.io/irpwm-handbook/` — then *Install app* |
| **Android** | Latest release → `IRPWM-Handbook.apk` |
| **Windows** | Latest release → `IRPWM-Handbook-Setup.exe` (or `-Portable.exe`) |
| **iPhone / iPad** | Open the web app in Safari → Share → **Add to Home Screen** |

## How it is built
- `www/` — the app itself (single-page HTML, offline service worker, manifest, self-hosted fonts). GitHub Pages serves this folder.
- `electron/` + `package.json › build` — Windows desktop shell (Electron + electron-builder, NSIS installer and portable exe).
- `capacitor.config.json` + `assets/` — Android shell (Capacitor). The Android project is generated on the build server.
- `.github/workflows/build.yml` — on every push to `main`: deploys Pages, builds the APK and Windows installers, and publishes them as a GitHub Release.

## Updating the content
Edit `www/index.html` (or rebuild it from the handbook sources) and bump the cache name in `www/sw.js`, then commit. Everything rebuilds automatically.

## Notes
- The APK is signed with the fixed debug key in `android-signing/` so new versions install over old ones. For Google Play, create a private upload key instead.
- Windows installers are not code-signed, so SmartScreen asks once (More info → Run anyway).
- A native iOS build needs an Apple Developer account and a Mac/Xcode signing step; the installable web app covers iPhone and iPad without that.
