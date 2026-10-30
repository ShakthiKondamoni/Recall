# Database foundation and recovery

## Local adapter

`database/adapters/sqlite.ts` uses Node’s built-in `node:sqlite` `DatabaseSync`. It enables `PRAGMA foreign_keys=ON`, a busy timeout and WAL mode. The API opens the database before binding and readiness runs actual schema/settings queries. Electron supplies a path under `app.getPath('userData')`; web development uses the configured `DATABASE_PATH` (default `./data/recall.db`). The renderer has no database connection or file path.

## Schema in `001-app-settings`

- `schema_migrations(id PRIMARY KEY, checksum, applied_at)` tracks migration identity and SHA-256 checksum.
- `app_settings(id PRIMARY KEY, key UNIQUE, value, created_at, updated_at)` has a key-length constraint. The repository allowlists `appearance.theme` and `app.onboarding`, and performs parameterized insert/upsert queries.
- No `users` table is created: there are no accounts or fake users.
- No API credentials should be stored here. Sensitive provider configuration is not in this task.

## Migration behavior

Migrations run in `BEGIN IMMEDIATE` transaction. The migration is inserted into history only after schema DDL succeeds. Reopening is idempotent. If an already-applied migration’s checksum has changed, startup stops rather than silently modifying the user’s schema.

## Backup/recovery

1. Stop Recall cleanly before copying the database. WAL mode may also use `recall.db-wal` and `recall.db-shm`; include them in a consistent offline backup or use SQLite’s online backup facilities in a future admin command.
2. Keep an untouched copy of the user data directory before any recovery attempt.
3. Investigate filesystem permissions and free disk before restarting. The application does not auto-delete, reset or overwrite the database on error.
4. Restore the last known-good database plus its associated files from backup with the app stopped. Reopen Recall and verify `/api/ready`.
5. Never edit `schema_migrations` checksums to bypass a failure. Build a forward migration in a later task.

Cloudflare D1 is only a future async repository port; it is not implemented or deployed.
