# Architecture decisions

1. **One renderer UI:** Vite/React is built once; Electron loads those static assets. No forked desktop UI.
2. **Node local API:** Hono uses the Node server adapter, not Cloudflare Worker runtime, because SQLite and local filesystem access are required in desktop local mode.
3. **SQLite with built-in driver:** `node:sqlite` avoids native addon rebuilds and npm native-install variability on Windows. It is available in the supported Node/Electron runtime, but Electron/Windows support remains a required verification gate.
4. **Minimal initial schema:** Task 01 creates only `app_settings` and `schema_migrations`; no dummy user/auth rows.
5. **Migration safety:** Each migration stores a SHA-256 digest and applies in an immediate transaction. A changed already-applied migration fails closed; recovery is backup/restore, not destructive automatic reset.
6. **Short-lived API auth:** The process manager generates a cryptographic random 256-bit token per launch. The renderer never receives it. Web proxy and desktop main attach it. The desktop listener uses `127.0.0.1` and an ephemeral port.
7. **Narrow desktop IPC:** Two methods (`runtime`, `read`) expose no channel names, credentials, filesystem chooser, or raw Node APIs. Paths and sender/frame are validated.
8. **Origin and navigation restrictions:** Packaged renderer uses `recall://app`, sandbox/context isolation, no Node integration, CSP, denied popup/window/permissions, and no remote content. Web development HTTP URL is restricted to local development.
9. **Separate storage roots:** Electron profile data lives in OS userData; web development data lives under ignored local `data/`. No synchronization or profile migration is automatic.
10. **D1 only as future port:** Cloud Workers require separate async adapter, auth, storage and deployment; the local adapter is not imported into a cloud environment.
11. **Pinned package manifests:** Direct versions are pinned; a pnpm lockfile still must be created by the target environment before CI/release can be considered reproducible.
12. **No authentication or AI fakes:** The interface labels unavailable features, does not show fabricated study metrics, and disclaims unconnected AI.
