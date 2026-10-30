# Module map

| Module | Responsibility | Depends on |
|---|---|---|
| `apps/web/src` | Shared React shell, dashboard, settings and themes | Contracts, browser runtime |
| `apps/web/src/lib/runtime.ts` | Select browser or typed preload runtime | `@recall/contracts` |
| `apps/api/src` | Hono HTTP routes, env parsing, safe errors and logging | Domain port, SQLite adapter |
| `database/adapters/sqlite.ts` | SQLite initialization, checked migrations and allowlisted settings | Node `node:sqlite`, SQL migration |
| `database/migrations` | Versioned baseline schema | SQLite SQL |
| `packages/contracts` | Zod schemas for theme, public info, runtime and IPC paths | Zod |
| `packages/domain` | Storage and repository interfaces | None / TS only |
| `storage/local` | Opaque-key, confined filesystem storage | Node filesystem |
| `apps/desktop/src/main` | Window security, runtime protocol, IPC, backend lifecycle and per-user data path | Electron, API child manager |
| `apps/desktop/src/preload` | Minimal typed runtime/read bridge | Electron IPC |
| `scripts` | Build, development orchestration, migrations, backend manager | Local toolchain |
| `tests` | Unit, direct API, native SQLite/storage, browser and Electron smoke coverage | Vitest, Node test, Playwright |

Dependency direction: UI → runtime/contracts; routes → application service → domain ports; infrastructure adapters implement ports. Electron is confined to the desktop main and preload; it is absent from shared UI/domain code.
