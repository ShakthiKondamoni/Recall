import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { startBackend } from './backend-manager.mjs';

if (!existsSync('.env')) throw new Error('Missing .env. Run: Copy-Item .env.example .env');
if (!existsSync('node_modules')) throw new Error('Dependencies are missing. Run corepack pnpm install.');
process.loadEnvFile('.env');
const mode = process.argv[2] ?? 'web';
const buildTarget = mode === 'desktop' ? 'desktop-shell' : 'api';
const built = spawnSync(process.execPath, ['scripts/build.mjs', buildTarget], { stdio: 'inherit' });
if (built.error) {
  console.error(`[Recall dev] Could not start build target "${buildTarget}":`, built.error);
  process.exit(1);
}
if (built.status !== 0) {
  const outcome = built.status === null ? `signal ${built.signal ?? 'unknown'}` : `exit code ${built.status}`;
  console.error(`[Recall dev] Build target "${buildTarget}" failed with ${outcome}.`);
  process.exit(built.status ?? 1);
}

let backend, web, desktop;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  try {
    if (desktop && !desktop.killed) desktop.kill();
    await web?.close();
    await backend?.stop();
  } catch (error) {
    console.error(error.message);
    code = 1;
  }
  process.exit(code);
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

try {
  if (mode !== 'desktop') {
    backend = await startBackend({ entry: resolve('apps/api/dist/index.cjs') });
    process.env.RECALL_RUNTIME_TOKEN = backend.token;
    process.env.RECALL_API_URL = backend.baseUrl;
    backend.onUnexpectedExit(code => {
      console.error('API unexpectedly exited:', code);
      void stop(1);
    });
  }
  if (mode !== 'api') {
    const { createServer } = await import('vite');
    web = await createServer({ configFile: resolve('apps/web/vite.config.ts') });
    await web.listen();
    console.log('Recall web: http://localhost:' + (process.env.WEB_PORT ?? 5173));
  }
  if (mode === 'desktop') {
    const { default: electron } = await import('../apps/desktop/node_modules/electron/index.js');
    desktop = spawn(electron, ['apps/desktop'], {
      stdio: 'inherit',
      env: { ...process.env, RECALL_DEV_URL: 'http://localhost:' + (process.env.WEB_PORT ?? 5173) },
    });
    desktop.on('error', error => {
      console.error(error.message);
      void stop(1);
    });
    desktop.on('exit', code => void stop(code ?? 1));
  }
  if (backend) console.log('Recall API: ' + backend.baseUrl + ' (session authenticated)');
} catch (error) {
  console.error('Recall startup failed:', error.message);
  await stop(1);
}
