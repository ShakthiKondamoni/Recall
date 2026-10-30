import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
await build({entryPoints:['tests/native/api-node.test.ts'],outfile:'dist/api-node.test.cjs',platform:'node',format:'cjs',target:'node22',bundle:true});
const result=spawnSync(process.execPath,['--test','dist/api-node.test.cjs'],{stdio:'inherit'});if(result.error)throw result.error;process.exit(result.status??1);
