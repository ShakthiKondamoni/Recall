import { describe,it,expect } from 'vitest';
import { createApp } from '../../apps/api/src/app/index.ts';
import { parseConfig } from '../../apps/api/src/config/env.ts';
import { openDatabase } from '../../database/adapters/sqlite.ts';
import { AppError } from '../../apps/api/src/errors/index.ts';
const token='t'.repeat(64);const config=parseConfig({NODE_ENV:'production',RECALL_RUNTIME_TOKEN:token,LOG_LEVEL:'error'});const headers={authorization:'Bearer '+token};
describe('Hono local API',()=>{
 for(const path of ['/health','/ready','/app/info'])it('serves '+path,async()=>{const db=openDatabase(':memory:');const response=await createApp(config,db).request('/api'+path,{headers});expect(response.status).toBe(200);db.close();});
 it('rejects missing credentials',async()=>{const db=openDatabase(':memory:');expect((await createApp(config,db).request('/api/health')).status).toBe(401);db.close();});
 it('rejects direct cross-origin requests',async()=>{const db=openDatabase(':memory:');expect((await createApp(config,db).request('/api/health',{headers:{...headers,origin:'https://untrusted.invalid'}})).status).toBe(403);db.close();});
 it('validates unexpected input',async()=>{const db=openDatabase(':memory:');expect((await createApp(config,db).request('/api/health?invalid=1',{headers})).status).toBe(400);db.close();});
 it('returns structured not-found responses',async()=>{const db=openDatabase(':memory:');const response=await createApp(config,db).request('/api/missing',{headers});expect(response.status).toBe(404);expect((await response.json()).error.code).toBe('NOT_FOUND');db.close();});
 it('reports unavailable database',async()=>{const db=openDatabase(':memory:');const app=createApp(config,db);db.close();expect((await app.request('/api/ready',{headers})).status).toBe(503);});
 it('returns only safe app info',async()=>{const db=openDatabase(':memory:');const body=await (await createApp(config,db).request('/api/app/info',{headers})).text();expect(body).not.toContain(token);expect(body).not.toContain('DATABASE_PATH');expect(JSON.parse(body).capabilities.ai).toBe(false);db.close();});
 it('redacts internal errors in production',async()=>{const db=openDatabase(':memory:');const app=createApp(config,db);app.get('/test-error',()=>{throw new Error('SECRET stack marker');});const response=await app.request('/test-error');expect(response.status).toBe(500);expect(await response.text()).not.toMatch(/SECRET|stack/);db.close();});
 it('maps deliberate forbidden errors',async()=>{const db=openDatabase(':memory:');const app=createApp(config,db);app.get('/test-forbidden',()=>{throw new AppError(403,'FORBIDDEN','Not permitted');});expect((await app.request('/test-forbidden')).status).toBe(403);db.close();});
});
