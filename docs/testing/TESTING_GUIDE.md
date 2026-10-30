# Testing guide

## Test layers

- **Native foundation:** `corepack pnpm test:native` executes Node’s built-in test runner for SQLite initialization, idempotent/checksummed migrations, settings repository, foreign-key behavior, unavailable DB, and local object storage.
- **API integration:** `corepack pnpm test:api-native` builds a temporary bundle and runs Hono endpoints, auth, origin validation, query validation, 404, 503 dependency handling, safe app info, production redaction, startup env validation, and managed child lifecycle.
- **Vitest:** `corepack pnpm test` covers Zod theme/runtime contracts and configuration validation, plus Hono API endpoint integration tests.
- **Playwright web:** `corepack pnpm test:e2e` checks dashboard, modal/sidebar navigation, settings, six persisted themes, unknown-route recovery, and error/retry state. It starts a fresh Vite dev server; browser binaries may need Playwright installation.
- **Playwright desktop:** `corepack pnpm test:desktop` checks shared UI, Node isolation, bridge/runtime, API readiness, route allowlisting, themes, BrowserWindow configuration and shutdown. Requires built renderer/API and a runnable Electron display environment.

## Windows results supplied by requester — October 30, 2026

These are user-provided command results, not independently rerun in the current agent environment.

| Check | Recorded result |
|---|---|
| `corepack pnpm install` | Reported passed in the earlier Windows update; lockfile presence/commit was not independently checked here. |
| `corepack pnpm typecheck` | Passed/reported no TypeScript errors. |
| `corepack pnpm lint` | Passed/reported no ESLint errors. |
| `corepack pnpm test` | Passed: 3 files, 20 tests (desktop-security 4, contracts 5, API integration 11). |
| `corepack pnpm build` | Transcript reached Vite success: 1,600 modules, 2.18s. It ends there without a final exit code or separate API/Electron stage outputs. |
| `corepack pnpm build:web` | Web build is reported passed in the supplied Windows status. |
| `corepack pnpm build:api` | No independent result was supplied. |
| `corepack pnpm build:desktop` | No independent result was supplied. |
| `corepack pnpm test:api-native` | No result was supplied for the managed child lifecycle suite. |
| `corepack pnpm test:desktop` | No result was supplied. |
| `corepack pnpm package:win` | No result or installer artifact was supplied. |
| Electron app launch and shutdown | Not confirmed. Earlier Dashboard/Settings web launch was reported, but that does not prove desktop runtime. |

The captured root build transcript predates the current build-runner change. Do not treat it as a verified run of the new API → web → Electron → asset-staging sequence.

## Current agent-session checks — Linux sandbox

The sandbox is Linux with Node v26.12.1, without Corepack, pnpm, npm, Electron/Wine, the project `node_modules`, or a lockfile. `list_remote_machines` returned no authorized Windows machine.

| Check | Result |
|---|---|
| `node --check scripts/build.mjs` | Passed. |
| `node --check scripts/dev.mjs` | Passed. |
| Invalid build target diagnostic | Passed: clear usage message and exit 2. |
| API build stage diagnostic | Correctly named the API stage; stopped because `esbuild` is not installed. Not an API build result. |
| Web build stage diagnostic | Correctly named the web stage; stopped because `corepack` is not installed. Not a Vite build result. |
| `corepack pnpm --version`, `install`, `typecheck`, `lint`, `test`, `build`, `build:api`, `build:web`, `build:desktop`, `test:api-native`, `test:desktop`, `dev:web`, `dev:desktop`, `package:win` | All blocked before pnpm execution: `FileNotFoundError: corepack`. |
| Earlier `node --test tests/native/foundation.test.mjs` record | 9/9 passed in the earlier sandbox run; not rerun after this build-script edit. |

These script diagnostics verify error reporting only. They are not successful production builds, desktop smoke tests or installer tests.

## Security coverage and remaining runtime checks

`tests/unit/desktop-security.test.ts` asserts the exact BrowserWindow options factory used by the application, including `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`; it also checks navigation policy, popup denial, and the IPC sender/main-frame/origin validation helper wired into main. `tests/desktop/smoke.spec.ts` is authored to launch Electron and exercise the real narrow preload bridge, including the `read`/`runtime` key surface. It no longer calls Electron 37’s unsupported `getLastWebPreferences()` method. The supplied 20/20 Vitest result includes the four security unit tests; it does not show the Playwright desktop smoke test running.

Source review confirms the main process binds the API to `127.0.0.1`, waits for child ready IPC plus authenticated `/api/ready` before loading the renderer, keeps the token out of preload, validates IPC sender/frame/URL and route path, denies navigation/popup/permission requests, and awaits backend stop during app quit. These are code/test-definition findings, not proof that the live backend lifecycle or Electron runtime was exercised.

## Warnings and dependency scripts

- **Node SQLite:** the Windows Vitest transcript emits `ExperimentalWarning` for `node:sqlite`. Node.js v24.14.0 marks it Stability 1.1 (Active development). This warning is expected, is not itself a test failure, and is not suppressed; the API remains experimental.
- **electron-winstaller:** the configured packager is Electron Builder’s NSIS x64 target, not Squirrel.Windows. `electron-winstaller` is not required by the configured NSIS workflow, so no build script approval or approval command is appropriate. The source archive lacks a lockfile/install tree, so the exact resolved transitive version and lifecycle script were not available to inspect.
- **Corepack/pnpm:** use `packageManager: "pnpm@10.11.0"`. `devEngines.packageManager` is a pnpm 11 feature and is intentionally not added to a pnpm 10.11.0 project. `onlyBuiltDependencies` belongs in `pnpm-workspace.yaml`.

## Windows rerun checklist

1. Confirm `corepack pnpm --version` returns 10.11.0; run `corepack pnpm install`.
2. Run `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm test:native`, and `corepack pnpm test:api-native`.
3. Run `corepack pnpm test:e2e` if browser binaries are installed.
4. Run each build independently: `corepack pnpm build:api`, `corepack pnpm build:web`, `corepack pnpm build:desktop`, then `corepack pnpm build`.
5. Launch `corepack pnpm dev:desktop`; verify Dashboard, Settings, theme selection, readiness, and graceful shutdown.
6. Run `corepack pnpm test:desktop` and explicit `corepack pnpm package:win`; inspect/install the generated unsigned NSIS artifact and verify startup/shutdown.

Do not mark Task 01 complete until those target-Windows checks, especially desktop launch and packaging, have actual recorded results.
