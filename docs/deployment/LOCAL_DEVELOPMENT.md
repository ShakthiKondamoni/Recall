# Windows local development

## Requirements

Node.js 24 or later within the manifest range `>=24 <27`, Corepack, the project-pinned pnpm 10.11.0 (`packageManager` in the root manifest), Windows 11, and Internet for initial package/Electron downloads. Use `corepack pnpm`; a separately installed `pnpm` on PATH may be a different version and is not used by project-owned recursive scripts. The installed desktop application uses Electron’s embedded Node runtime; the command-line Node version is used for development and builds.

The `devEngines.packageManager` field is not used: pnpm 10.11.0 predates support for that field. Keep the exact `packageManager: "pnpm@10.11.0"` pin for Corepack.

## First setup

```powershell
Copy-Item .env.example .env
corepack pnpm install
```

The runtime session token is generated in memory at startup and must not be added to `.env`. `.env` stays untracked. No global package installation or system setting change is performed by the launcher scripts.

## Run

```powershell
corepack pnpm dev:web       # browser URL http://localhost:5173
corepack pnpm dev:api       # API-only, local authenticated process
corepack pnpm dev:desktop   # shared UI inside Electron
```

For launchers, double-click or run `start-recall-web.bat` / `start-recall-desktop.bat`. They check for Node, Corepack, `.env`, and installed workspace dependencies and return actionable errors.

`dev:desktop` builds the API and Electron shell for development, starts Vite, and points Electron at the local Vite URL. It uses the internal `desktop-shell` build target; it does not require or create the production web renderer.

## Production build commands

```powershell
corepack pnpm build:api       # API bundle only
corepack pnpm build:web       # Vite renderer only
corepack pnpm build:desktop   # API + web + Electron + desktop asset checks
corepack pnpm build           # full production build; no installer
corepack pnpm package:win     # explicit NSIS x64 installer packaging
```

The full build order is API, web, Electron main/preload, then desktop asset staging. `packages/contracts` and `packages/domain` are source exports consumed by the bundlers; they do not have separate `dist` build commands. `package:win` is the only command in this flow that invokes Electron Builder or downloads installer packaging assets.

## Data and service boundaries

The browser profile stores development data beneath `./data/` (ignored by Git). Electron stores its SQLite database and future local objects beneath the OS-provided per-user app-data directory, outside the installation folder. No local/cloud sync is configured. Do not bind the API to a LAN interface or deploy the development Vite proxy publicly.

`corepack pnpm db:migrate` applies the initial migration; it does not reset data. Back up and stop the API before manual SQLite recovery.

## Verification note

The Windows transcript supplied on October 30, 2026 reports passing typecheck, lint, the 20-test Vitest suite and Vite build. The transcript predates the current labeled build pipeline and does not verify API/Electron builds, an Electron launch or packaging. See `IMPLEMENTATION_STATUS.md` before treating Task 01 as complete.
