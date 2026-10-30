# Changelog

## 0.1.0 — Task 01 foundation

- Added pnpm monorepo foundation, typed contracts and a domain persistence boundary.
- Added React/Vite learning-workspace shell, dashboard new-user empty state, settings, responsive navigation and six persistent themes.
- Added authenticated local Hono health/readiness/app-info API, environment validation, structured request logging, error redaction and same-origin desktop/web runtime contracts.
- Added transactional checksummed SQLite initial migration, settings repository, local filesystem object-storage boundary, and test coverage.
- Added Electron main/preload source, origin-restricted shared renderer, random session credential, readiness-checked backend process lifecycle, loopback API access, and NSIS packaging configuration.
- Added testing setup and Windows launch/build convenience scripts.
- Recorded all unverified builds, install requirements and platform limitations in implementation status and testing documentation.

## Task 01.1 — Windows verification and build stabilization

- Kept `packageManager` pinned to pnpm 10.11.0, routed project-owned nested pnpm invocations through Corepack, and moved `onlyBuiltDependencies` to `pnpm-workspace.yaml`.
- Replaced raw API startup error-message logging with a safe error-code diagnostic and added validated SQLite result-column handling without weakening migration checksum or foreign-key checks.
- Added typed `Window.recall` declarations and testable Electron window/security policies; removed the smoke test's unsupported `getLastWebPreferences()` call while preserving security assertions.
- Updated verification and dependency-script documentation. Windows installation, full project checks/builds, and Electron launch remain unverified in this execution environment; Task 01 is not marked complete.

## Task 01.2 — Final TypeScript and production-build repair

- Renamed the Playwright `Page` variable in the Electron smoke test so `window.recall` inside `page.evaluate()` resolves to the browser `Window`; retained the existing bridge, API authorization/rejection, theme, runtime, and shutdown assertions.
- Marked the synchronous public `theme-init.js` script `vite-ignore` to keep its pre-paint classic-script behavior while excluding it from Vite HTML bundling.
- Removed `shell: true` with an argument array from the Windows web-build invocation. Windows now calls `ComSpec`/`cmd.exe` with a fixed command string; non-Windows calls Corepack with separate arguments.
- Documented the ignored `electron-winstaller` script as unnecessary for the configured NSIS target; no dependency script approval was added.
- Recorded the user's reported Windows results separately from checks actually run in this isolated environment. Corepack-based checks and production builds remain unverified here because Corepack and installed project dependencies are unavailable; Task 01 is not marked complete.

## Task 01.3 — Windows desktop runtime and packaging verification

- Added a smoke-test assertion that the public runtime response contains only its documented fields and capabilities, with no field through which the API token could be exposed.
- Reviewed Electron window preferences, the narrow preload bridge, main-process token handling, loopback API binding, readiness handshake, IPC sender checks, navigation/popup restrictions, and shutdown behavior; these source-level findings are recorded separately from runtime test results.
- Incorporated the requester-supplied Windows transcript: TypeScript and ESLint show no errors; Vitest reports 20/20 tests passed, including 4 desktop security unit tests; Node emits the experimental SQLite warning; and the composite build reaches a successful Vite build (1,600 modules, 2.18s). The script performs API and desktop esbuild stages before Vite, but separate build commands and an explicit final exit code were not supplied.
- No `test:desktop`, actual Electron launch, `package:win`, or installer result was supplied. The agent environment could not run them. The added smoke assertion is not confirmed as included in the Windows run.
- Confirmed the configured NSIS workflow does not require `electron-winstaller`; no dependency script was approved. No installer was generated in this verification session.

### Task 01.3 build-workflow follow-up — October 30, 2026

- Updated `scripts/build.mjs` to run API → web → Electron main/preload → desktop asset staging with explicit stage diagnostics, target validation, failure propagation, and an internal `desktop-shell` path for development. The standard production build still does not run packaging.
- Updated `scripts/dev.mjs` to use `desktop-shell` for `dev:desktop` and report build process startup/status failures.
- Updated README, local-development, web/desktop, Electron and testing guides with the build order, pnpm pin, observed Windows transcript, sandbox limitations, and remaining Windows rerun checklist.
- The updated scripts pass `node --check`; the invalid-target and missing-tool failure paths were exercised. These checks are not production builds.
- The supplied Windows typecheck/lint/20-test/Vite transcript predates the build-runner change. In this sandbox every `corepack pnpm` command was blocked because Corepack is absent; direct API bundling also requires unavailable `esbuild`. No current API/Electron build, Electron launch, backend lifecycle run, or installer is claimed.
- Kept the exact pnpm 10.11.0 `packageManager` pin; `devEngines.packageManager` is a pnpm 11 feature. The configured NSIS target does not need `electron-winstaller`; no dependency build script was approved.
