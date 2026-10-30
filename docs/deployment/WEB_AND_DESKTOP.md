# Web and desktop deployment boundary

| Concern | Browser web development | Windows desktop |
|---|---|---|
| UI | Shared React/Vite source | Same React/Vite output |
| API access | Same-origin Vite proxy injects per-run token | Main process calls authenticated local API via narrow preload IPC |
| API process | `corepack pnpm dev:web` manages local Hono child | Electron main manages local Hono child |
| Bind | API `127.0.0.1`; Vite `127.0.0.1` | API `127.0.0.1`, ephemeral port |
| Database/storage | `.env` path, ignored local data | OS per-user Electron `userData` path |
| User authentication | Not implemented | Not implemented |
| Cloud deployment/sync | Not implemented | Not implemented |

The web mode here is **local development**, not a hosted site. Future cloud deployment needs a hosted auth boundary, origin/CSRF protection, deployment-specific persistence, service separation and operational settings. Cloudflare Workers cannot use the local filesystem/SQLite adapter; implement separate D1/R2-backed async infrastructure before such deployment. Local and cloud datasets remain separate; there is no replication or sync protocol.

## Production build and packaging

The root production pipeline runs in this order:

1. Bundle the Hono API (`apps/api/dist/index.cjs`).
2. Build the Vite renderer (`apps/web/dist`).
3. Bundle Electron main and preload (`apps/desktop/dist/main.cjs` and `preload.cjs`).
4. Stage the API runtime asset and check that the web entry asset exists.

The workspace packages `@recall/contracts` and `@recall/domain` export TypeScript source. They have no separate `dist` compilation step; consumer build tools bundle these exports.

`corepack pnpm build:api`, `build:web`, and `build:desktop` provide independent API, web and full desktop production builds. `corepack pnpm build` is the full build and does not invoke packaging. Only `corepack pnpm package:win` runs Electron Builder for the configured NSIS x64 installer. `corepack pnpm dev:desktop` uses an internal API/Electron shell build and the Vite dev server, not the production renderer.

## Verification boundary

The October 30, 2026 Windows transcript reports TypeScript, ESLint, 20/20 Vitest tests and a Vite build (1,600 modules, 2.18 seconds). It predates the current stage-logged build runner and does not independently prove the API/Electron bundles, desktop launch, backend lifecycle or installer. In the available Linux sandbox, script syntax and failure reporting were checked, but Corepack and project dependencies were unavailable. See `IMPLEMENTATION_STATUS.md` for exact outcomes.
