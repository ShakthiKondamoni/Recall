# Architecture overview

Recall has one React renderer source/build for web and Electron. React consumes a typed runtime contract; it does not import Node.js, call SQLite, receive credentials, or expose arbitrary local paths.

```text
React + Vite UI
   ├── browser → same-origin development proxy → authenticated loopback Hono API
   └── Electron → strict preload bridge → Electron main → managed API child → SQLite/local storage
```

The browser implementation communicates through `/api/*` in the Vite proxy, which adds an ephemeral runtime token server-side. The desktop renderer calls only two typed preload methods. The main process validates the calling frame and an allowlisted API path, then attaches the short-lived token. The desktop API binds to `127.0.0.1` on an OS-assigned port; the manager receives the real port and waits for the authenticated readiness response.

The API depends on `DatabasePort`/settings repository abstractions; the local adapter uses Node’s built-in SQLite driver and versioned SQL migration. `AsyncSettingsRepository` sketches the future D1-compatible async boundary; no D1 implementation is supplied. `ObjectStorage` represents storage independently; `LocalStorage` accepts only server-generated opaque keys and confines resolved paths to its root.

The web and desktop profiles are intentionally separate. Electron stores `recall.db` and storage beneath `app.getPath('userData')`, not the installation directory. No cloud sync is implied. The local filesystem adapter is a Node service and is not used by a Cloudflare Worker.

**Hosting caution:** The local browser/API modes are development foundations, not hardened internet-facing deployment. The local bearer-token setup and single-user/no-account boundary are not substitutes for cloud authentication, TLS, rate limits, or tenant isolation.
