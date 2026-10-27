# IRPWM — Indian Railways Permanent Way Manual (digital edition)

The complete **Indian Railways Permanent Way Manual, 2024 reprint, incorporating Advance Correction Slips up to No. 16**, as an offline app for Android, iPhone/iPad and Windows.

| Platform | How to get it |
|---|---|
| **Any device (web app)** | `https://<owner>.github.io/irpwm-handbook/` — then Install |
| **Android** | Latest release → `IRPWM-Android.apk` |
| **Windows** | Latest release → `IRPWM-Windows-Setup.exe` (or `-Portable.exe`) |
| **iPhone / iPad** | Open the web app in Safari → Share → **Add to Home Screen** |

## Contents of the app
- Complete text of all 15 chapters, para by para, with tables reproduced as tables
- Annexures, drawings, equations and scanned material in their original page layout
- Register of Advance Correction Slips 1–16, linked to every marked location; amended text highlighted
- Full-text search, para-number jump, cross-reference links, bookmarks, original-page viewer
- Explanatory notes and field calculators (study aids; not part of the manual)

## Repository layout
- `www/` — the app (served by GitHub Pages; packaged into the Android and Windows apps)
- `www/data/` — the manual text, one JSON file per chapter; `www/irpwm.pdf` — the original pages
- `electron/` — Windows shell; `capacitor.config.json` — Android shell
- `.github/workflows/build.yml` — builds and publishes everything on each push to `main`

In case of any discrepancy, the printed manual and the latest Railway Board and RDSO instructions prevail.
