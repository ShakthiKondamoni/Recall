# API reference — local foundation

All `/api/*` routes require `Authorization: Bearer <per-run token>`. The token is created by the development or desktop backend manager and is never embedded in the web build or renderer. A browser-origin header is rejected; in web development the Vite proxy removes it and adds the token. Electron uses its allowlisted IPC route. This is a local-development API—not a public cloud interface.

## Endpoints

### `GET /api/health`

Liveness only. HTTP 200:

```json
{"name":"Recall","status":"ok","version":"0.1.0","environment":"development"}
```

### `GET /api/ready`

Database/migration readiness. HTTP 200:

```json
{"status":"ready","checks":{"database":"ok","initialization":"ok"}}
```

Missing/unavailable database returns 503 `DEPENDENCY_UNAVAILABLE`.

### `GET /api/app/info`

Safe public app configuration; never includes paths, runtime tokens, environment variables or credentials:

```json
{"name":"Recall","version":"0.1.0","environment":"development","deploymentMode":"local","capabilities":{"settings":true,"learning":false,"ai":false,"cloud":false}}
```

### Error envelope

```json
{"error":{"code":"UNAUTHORIZED","message":"A valid local session is required.","requestId":"<uuid>"}}
```

Codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `INTERNAL_ERROR` (500), `DEPENDENCY_UNAVAILABLE` (503). Production internal errors use a generic message; details are not returned. Each response includes `X-Request-Id` and `Cache-Control: no-store`.

No account, learning or settings-write routes exist in Task 01. API route paths are also enumerated in the preload Zod IPC contract to prevent arbitrary renderer requests.
