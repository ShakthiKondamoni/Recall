import { Hono } from 'hono';
import { ZodError,z } from 'zod';
import { randomUUID,timingSafeEqual } from 'node:crypto';
import type { DatabasePort } from '@recall/domain';
import type { Config } from '../config/env.ts';
import { AppError } from '../errors/index.ts';
import { logger } from '../middleware/logger.ts';
import { ApplicationService } from '../services/application.ts';
import { applicationRoutes } from '../routes/application.ts';
export function createApp(config:Config,database:DatabasePort){
 const app=new Hono<{Variables:{requestId:string}}>();const log=logger(config.LOG_LEVEL);
 app.use('*',async(c,next)=>{const requestId=randomUUID();c.set('requestId',requestId);c.header('X-Request-Id',requestId);c.header('Cache-Control','no-store');c.header('X-Content-Type-Options','nosniff');const started=Date.now();await next();log('info','request',{requestId,status:c.res.status,method:c.req.method,durationMs:Date.now()-started});});
 app.use('/api/*',async(c,next)=>{
  const received=Buffer.from(c.req.header('authorization')??'');const expected=Buffer.from('Bearer '+config.RECALL_RUNTIME_TOKEN);
  if(received.length!==expected.length||!timingSafeEqual(received,expected))throw new AppError(401,'UNAUTHORIZED','A valid local session is required.');
  if(c.req.header('origin'))throw new AppError(403,'FORBIDDEN','Direct browser requests are not permitted. Use the local application.');
  z.object({}).strict().parse(c.req.query());
  await next();
 });
 app.route('/api',applicationRoutes(new ApplicationService(config,database)));
 app.notFound(()=>{throw new AppError(404,'NOT_FOUND','Endpoint not found.');});
 app.onError((error,c)=>{const requestId=c.get('requestId');if(error instanceof ZodError)return c.json({error:{code:'VALIDATION_ERROR',message:'Request validation failed.',requestId}},400);const known=error instanceof AppError;const status=known?error.status:500;const code=known?error.code:'INTERNAL_ERROR';log('error','request-failed',{requestId,code,status});return c.json({error:{code,message:known?error.message:'An internal error occurred.',requestId}},status);});
 return app;
}
