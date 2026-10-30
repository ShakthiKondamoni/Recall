# Recall — Task 01 foundation

Recall is a shared React study-workspace foundation for web and Windows desktop. The web UI uses React, Vite, TypeScript, React Router and Tailwind CSS; the backend is Hono on Node.js with SQLite. Electron loads the **same web build** through a custom secure `recall://` protocol and starts an authenticated loopback API child process.

## Current verification status — October 30, 2026

The requester supplied a Windows transcript showing TypeScript and ESLint completing without reported errors, all 20 Vitest tests passing (three files), and Vite producing 1,600 modules in 2.18 seconds. The captured root build transcript ends at Vite and does not include independent API/Electron stage results or a final exit code. It predates the build-runner changes documented below.

The updated build runner and development launcher pass `node --check` in the available Linux sandbox. Corepack, pnpm, project dependencies, Electron and Windows are unavailable there, so the updated production builds, desktop launch and installer were not verified. Earlier Dashboard/Settings browser launch was requester-reported; a Windows Electron launch is not confirmed. **Task 01 is not marked complete.** See [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) for the exact evidence and remaining checks.

## Prerequisites

- Windows 11 for desktop packaging; a supported OS for web development.
- Node.js 24 or later in the manifest range `>=24 <27`. The supplied Windows environment reports Node.js v24.14.0.
- Corepack and the project-pinned pnpm 10.11.0 (`packageManager` in the root manifest). Use `corepack pnpm`; Recall does not install a global package manager.
- Internet access for the first dependency installation and explicit Electron packaging.

The root `packageManager: "pnpm@10.11.0"` is the Corepack pin. Do not add `devEngines.packageManager` while staying on pnpm 10.11.0: that field is a pnpm 11 feature. The approved-build-dependency list is in `pnpm-workspace.yaml`, not the obsolete `pnpm` package.json field.

## Windows setup

From the project directory in PowerShell:

```powershell
Copy-Item .env.example .env
corepack pnpm install
```

No credentials are needed. The backend manager generates a fresh session token at every launch. Do not expose the development servers to another machine.

## Run

- Browser: `corepack pnpm dev:web`, then open `http://localhost:5173`.
- Local API only: `corepack pnpm dev:api` (authenticated; direct browser origins are rejected).
- Windows desktop development: `corepack pnpm dev:desktop`.
- Convenience launchers: `start-recall-web.bat`, `start-recall-desktop.bat`.
- Apply the database migration: `corepack pnpm db:migrate`.

The first use creates a local SQLite database and uses the `./data/storage` filesystem storage boundary. Electron’s database and storage instead live under Electron’s per-user application data directory. Never copy a database from one mode into another implicitly.

## Check and build

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm test:native
corepack pnpm test:api-native
corepack pnpm test:e2e
corepack pnpm test:desktop
```

Build targets are distinct:

- `corepack pnpm build:api` — API production bundle only.
- `corepack pnpm build:web` — Vite renderer only.
- `corepack pnpm build:desktop` — API, web renderer, Electron main/preload and desktop asset validation/staging.
- `corepack pnpm build` — full production build; it does not package an installer.
- `corepack pnpm dev:desktop` — development shell/API plus Vite dev server; it uses an internal `desktop-shell` target and does not build the production renderer.
- `corepack pnpm package:win` — explicit NSIS x64 packaging after a full build.

`packages/contracts` and `packages/domain` export TypeScript source and have no separate `dist` build; the API/Electron esbuild and web Vite steps consume them through workspace exports. The build runner labels each stage and propagates its failure. Installer downloads are not part of normal `build`.

A Windows installer built without configured signing credentials is **unsigned**. A signed release needs a separately configured certificate; none is included. Electron Builder downloads its packaging assets only during the explicit packaging command.

## Runtime warning

The Windows test transcript includes Node’s `ExperimentalWarning` for `node:sqlite`. Node.js v24.14.0 classifies this API as active development; the warning is not itself a test failure and is intentionally not suppressed. See the implementation status for the verification caveat.

## Product boundary

Task 01 implements Dashboard, Settings and six locally persistent themes. Other listed learning tools are visibly “coming soon”; no login, cloud deployment, study analytics, AI integration or learning activity is simulated. See [architecture overview](docs/architecture/OVERVIEW.md), [desktop guide](docs/desktop/ELECTRON.md) and [testing guide](docs/testing/TESTING_GUIDE.md).
