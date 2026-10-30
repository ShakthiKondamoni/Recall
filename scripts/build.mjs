import { access, copyFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const target = process.argv[2] ?? 'all';
const targets = new Set(['all', 'api', 'web', 'desktop', 'desktop-shell']);

if (!targets.has(target)) {
  console.error(`[Recall build] Unknown target "${target}". Expected: ${[...targets].join(', ')}.`);
  process.exitCode = 2;
} else {
  console.log('[Recall build] Shared workspace packages are source exports; API/Electron esbuild and web Vite bundle them in dependency order.');

  async function runStage(name, action) {
    console.log(`\n[Recall build] START ${name}`);
    try {
      await action();
      console.log(`[Recall build] PASS ${name}`);
    } catch (error) {
      console.error(`[Recall build] FAIL ${name}`);
      console.error(error instanceof Error ? error.stack ?? error.message : error);
      throw error;
    }
  }

  async function bundle(options) {
    const { build } = await import('esbuild');
    await build(options);
  }

  async function buildApi() {
    await mkdir('apps/api/dist', { recursive: true });
    await bundle({
      entryPoints: ['apps/api/src/index.ts'],
      outfile: 'apps/api/dist/index.cjs',
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      sourcemap: false,
    });
  }

  async function buildWeb() {
    await copyFile('apps/web/index.template', 'apps/web/index.html');
    const onWindows = process.platform === 'win32';
    const command = onWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'corepack';
    const args = onWindows
      ? ['/d', '/c', 'corepack pnpm --filter @recall/web build']
      : ['pnpm', '--filter', '@recall/web', 'build'];
    const result = spawnSync(command, args, { stdio: 'inherit', windowsHide: onWindows });

    if (result.error) {
      throw new Error(`Could not start the web build using ${command}: ${result.error.message}`, { cause: result.error });
    }
    if (result.status !== 0) {
      const outcome = result.status === null ? `signal ${result.signal ?? 'unknown'}` : `exit code ${result.status}`;
      throw new Error(`The Vite web build failed with ${outcome}.`);
    }
  }

  async function buildElectron() {
    await mkdir('apps/desktop/dist', { recursive: true });
    await bundle({
      entryPoints: ['apps/desktop/src/main/index.ts'],
      outfile: 'apps/desktop/dist/main.cjs',
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      external: ['electron'],
    });
    await bundle({
      entryPoints: ['apps/desktop/src/preload/index.ts'],
      outfile: 'apps/desktop/dist/preload.cjs',
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      external: ['electron'],
    });
  }

  async function stageDesktopAssets(requireWeb) {
    await mkdir('apps/desktop/dist/api', { recursive: true });
    await copyFile('apps/api/dist/index.cjs', 'apps/desktop/dist/api/index.cjs');
    if (requireWeb) await access('apps/web/dist/index.html');
  }

  async function buildDesktopPipeline(includeWeb) {
    await runStage('API production bundle', buildApi);
    if (includeWeb) await runStage('Web renderer production build', buildWeb);
    await runStage('Electron main and preload bundles', buildElectron);
    await runStage(
      includeWeb ? 'Desktop production asset staging' : 'Desktop development API staging',
      () => stageDesktopAssets(includeWeb),
    );
  }

  try {
    if (target === 'api') {
      await runStage('API production bundle', buildApi);
    } else if (target === 'web') {
      await runStage('Web renderer production build', buildWeb);
    } else {
      await buildDesktopPipeline(target !== 'desktop-shell');
    }
  } catch {
    process.exitCode = 1;
  }
}
