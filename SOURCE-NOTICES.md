# Source and licence notices

J&J Equity is maintained by Jay-deane Huni. Its product identity, workspace design and integration changes are part of this project. Original contributions and the integrated application are distributed under AGPL-3.0-only; the full licence is in the repository-root `LICENSE`.

## Market components

The market application began from [OpenTerminal](https://github.com/ErTasselli/openterminal) by ErTasselli and contributors. Its MIT copyright and permission notice is retained without alteration in `app/LICENSE`. That notice remains applicable to the inherited components. The complete local source, including J&J changes, is provided in `app/`.

## Intelligence components

The companion intelligence source is [World Monitor](https://github.com/koala73/worldmonitor) by Elie Habib and contributors, copyright 2024–2026, under AGPL-3.0-only. The bundled base revision is `59fe6bbc15082888aeb01295c3615dab5d1c1a04`, version 2.11.6. Its licence remains in `worldmonitor/LICENSE`; complete companion source and local modifications are retained in `worldmonitor/`.

J&J Equity’s interface presents native research panels. The desktop integration consumes the companion API handlers rather than embedding its web application. This is an independent application and is not an official upstream release.

## Other dependencies

Npm dependencies retain their own licences. Exact application resolutions are in `app/package-lock.json`; companion resolutions are in `worldmonitor/package-lock.json`. MapLibre notices remain alongside its copied worker assets. Electron includes its own licences in the application distribution. The desktop source archive and its file checksums are bundled with the Mac application, and the runtime retains these notices under `licences/`.

The J&J Equity monogram in `app/desktop/assets/` is a project-specific asset. Project branding does not remove or supersede third-party attribution.
