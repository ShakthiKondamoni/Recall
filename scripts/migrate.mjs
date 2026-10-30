import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
if(!existsSync('.env'))throw new Error('Missing .env. Copy .env.example to .env first.');
process.loadEnvFile('.env');
const build=spawnSync(process.execPath,['scripts/build.mjs','api'],{stdio:'inherit'});if(build.status!==0)process.exit(build.status??1);
const result=spawnSync(process.execPath,['apps/api/dist/index.cjs','--migrate'],{stdio:'inherit',env:{...process.env,RECALL_RUNTIME_TOKEN:randomBytes(32).toString('hex')}});if(result.error)throw result.error;process.exit(result.status??1);
