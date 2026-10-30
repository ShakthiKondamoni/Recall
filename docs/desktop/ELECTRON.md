# Electron desktop foundation

## Shared renderer and protocol

Development Electron opens the validated `http://localhost:<configured-port>` Vite URL. Packaged Electron serves the same Vite build through a privileged custom `recall://app/index.html` protocol. The protocol handler resolves requested files under the web asset root and rejects traversal. `webPreferences` sets `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and the application-owned preload. The renderer does not import `electron`, Node or filesystem modules.

## Main/preload/IPC

Preload exposes a frozen, typed, minimal `window.recall` object with `runtime()` and `read(path)`. The bridge does not expose the API token. The API path is validated against exactly `/api/health`, `/api/ready`, and `/api/app/info`. The main process checks sender WebContents, main-frame identity and trusted URL, and validates IPC argument count/types. IPC errors return useful generic local-service messages. There is no arbitrary IPC, shell, credential or file path API.

## Hardening

- Local-only development URL; packaged `recall://` origin.
- Navigation redirects away from the allowed app origin are prevented.
- `setWindowOpenHandler` denies new windows; session permission request/check handlers deny all permissions.
- CSP disallows remote resources, objects, and form submissions; packaged assets are local.
- BrowserWindow is sandboxed, context-isolated, and has Node integration disabled.
- API token is 32 random bytes per run and remains in main/backend manager; IPC bridge does not expose it.
- API is bound only to `127.0.0.1` on an OS-selected port; startup waits for IPC port announcement and authenticated `/api/ready`.
- Backend shutdown uses an IPC request, waits for process exit, and escalates to termination after its timeout.
- IPC sender validation compares the expected WebContents, exact main frame and allowed origin; IPC arguments are schema-checked.

## Build and packaging

The full production build order is API bundle → Vite renderer → Electron main/preload → desktop asset staging. `corepack pnpm build:api` builds the API only; `build:web` builds the renderer only; `build:desktop` and `build` run the complete production sequence. `packages/contracts` and `packages/domain` are source exports and have no separate `dist` build.

`corepack pnpm dev:desktop` uses the internal `desktop-shell` target (API and Electron main/preload only) and starts the development Vite server. The normal build does not run Electron Builder. Packaging is explicit: `corepack pnpm package:win` builds the configured x64 NSIS installer. It is unsigned unless signing credentials are separately configured.

The configured target is NSIS, not Squirrel.Windows. `electron-winstaller` is associated with the Squirrel.Windows path and is not required by this NSIS configuration. No dependency build script was approved. The source copy has no lockfile/install tree from which to inspect a resolved transitive package version; if packaging changes to Squirrel, inspect that exact package and script first.

## User data and runtime verification

Database and storage paths are provided from `app.getPath('userData')`; never write app data into `resources` or the install directory. NSIS is the selected Electron Builder target, product name `Recall`, ID `com.recall.study`, x64, with app-data preserved on uninstall. There is no custom ICO asset yet; Electron Builder uses its generic/default icon.

The requester-provided Windows record reports the security unit tests passing as part of 20/20 Vitest tests. It does not include a Playwright desktop-test result, actual Electron launch, backend readiness/shutdown trace or installer artifact. In the current Linux sandbox, neither Corepack nor Electron/dependencies were available. Source-level security review is not equivalent to live runtime verification; see `IMPLEMENTATION_STATUS.md` and `docs/testing/TESTING_GUIDE.md`.
