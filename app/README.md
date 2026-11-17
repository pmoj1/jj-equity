# J&J Equity application

A personal research terminal with separate market, intelligence and research desks. This folder contains the application source and the Mac desktop build tooling.

## Local development

Use Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
```

The web interface normally uses port 3000 and the market API uses port 4000. Requests pass through the web server so the local API credential stays server-side. The desktop application selects available loopback ports and retains its own app-data folder.

## Optional configuration

Keep private values in environment variables or a local `.env` file. Environment files and working portfolio databases are excluded from source archives.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Your Anthropic account key for assistant requests. |
| `ANTHROPIC_MODEL` | An exact model ID available to your account. Both this and the key are required. |
| `DATA_DIR` | Local portfolio, key and cache storage directory. Use a separate directory for test runs. |
| `API_HOST`, `API_PORT` | Market API binding. Keep the host on loopback for a personal installation. |
| `WEB_ORIGIN` | Allowed browser origin for API requests. |
| `API_KEY` | Optional explicit market API key; otherwise generated locally. |
| `API_URL`, `API_KEY_FILE` | Web-to-API connection and private key-file location. |
| `INTELLIGENCE_API_URL`, `INTELLIGENCE_TOKEN` | Private connection to a separately running intelligence sidecar. The desktop launcher configures these itself. |

The read-only API status endpoint reports readiness and last-observed provider outcomes, never key values. Optional provider credentials do not imply a subscription or entitlement. No live paid-provider verification is performed by the build.

## Checks

```sh
npm test
npm run test:desktop
npm run typecheck
npm run build
```

Server tests and desktop integration tests use different test runners. `npm test` runs the server’s Vitest suite; `npm run test:desktop` uses Node’s test runner. Keep personal databases out of test directories.

## Apple Silicon desktop package

On an Apple Silicon Mac, install the macOS command-line tools, Node.js 24 and npm, then run:

```sh
npm ci
npm run desktop:build
```

This builds the companion API handlers, generates reference geography, compiles the J&J application, runs desktop checks and prepares a local Mac package. It does not compile or embed the companion web interface. The source directories must remain side by side unless overridden below.

Build files live outside the source trees under `.jj-build/`; final source ZIP and DMG files go into the sibling `outputs/` directory. The desktop source ZIP includes current working changes, a file checksum manifest, the complete companion source and the retained notices. It excludes dependencies, credentials, environment files other than templates, local databases, caches and escaping symbolic links.

Electron is pinned in `desktop/package.json`. The packager verifies the archive against that release’s official `SHASUMS256.txt` before extraction. The resulting application uses a J&J icon and local ad-hoc signature. It is not notarized.

Individual steps are available as `desktop:intelligence`, `desktop:prepare`, `desktop:source` and `desktop:package`. Use these to repeat only the step affected by a change.

| Build override | Purpose |
| --- | --- |
| `JJ_WORLD_MONITOR_SOURCE` | Companion source directory. |
| `JJ_BUILD_DIR` | Build cache root. |
| `JJ_WM_RUNTIME_DEPS` | Prepared companion runtime `node_modules` directory. |
| `JJ_OUTPUT_DIR` | Output directory for source and desktop artifacts. |
| `JJ_PACKAGE_WORK` | Mac packaging cache directory. |
| `JJ_ELECTRON_ARCHIVE`, `JJ_ELECTRON_SHASUMS` | Locally available pinned Electron ZIP and matching release checksum manifest. Verification still runs. |

## Docker

```sh
docker compose up --build
```

Docker builds use the application lockfile and serve static assets from the standalone web package. The Compose ports are published to localhost, while container processes listen on their container network. The shared data volume contains the API’s generated key and portfolio database; the web service mounts it read-only. For an existing Docker installation, set `JJ_DATA_VOLUME` to its current volume name before starting the new Compose project, or explicitly migrate the data first. The default for a new installation is `jj-equity-data`. Do not delete a volume to upgrade the application.

## Data and scope

Quotes, news and intelligence feeds depend on external sources. An unavailable feed remains unavailable; the app does not manufacture replacement observations. Reference geography is not a live event feed. AI explanations need human review. The portfolio ledger records transactions locally and does not place broker orders.

Third-party licences and origin notices are retained in the repository’s [source notices](../SOURCE-NOTICES.md). Product branding, packaging and workspace behavior are maintained as J&J Equity.
