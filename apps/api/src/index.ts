import { serve } from '@hono/node-server';
import { openDatabase } from '../../../database/adapters/sqlite.ts';
import { LocalStorage } from '../../../storage/local/index.ts';
import { parseConfig } from './config/env.ts';
import { createApp } from './app/index.ts';
import { logger } from './middleware/logger.ts';
const config=parseConfig(process.env);const log=logger(config.LOG_LEVEL);
const database=openDatabase(config.DATABASE_PATH);
// Construct the local storage adapter without creating unused directories.
const storage=new LocalStorage(config.STORAGE_PATH);void storage;
if(process.argv.includes('--migrate')){database.check();database.close();log('info','migrations-applied');}
else {
 const server=serve({fetch:createApp(config,database).fetch,hostname:'127.0.0.1',port:config.API_PORT},address=>{process.send?.({type:'ready',port:address.port});log('info','server-ready');});
 let closing=false;
 function close(){if(closing)return;closing=true;server.close(()=>{database.close();process.exit(0);});setTimeout(()=>{log('error','shutdown-timeout');process.exit(1);},5000).unref();}
 process.on('message',message=>{if(typeof message==='object'&&message!==null&&'type' in message&&message.type==='shutdown')close();});
 process.on('disconnect',close);process.on('SIGINT',close);process.on('SIGTERM',close);
 server.on('error',error=>{const code='code' in error && typeof error.code==='string'?error.code:'UNKNOWN';log('error','server-start-failed',{code});database.close();process.exit(1);});
}
