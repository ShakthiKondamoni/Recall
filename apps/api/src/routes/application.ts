import { Hono } from 'hono';
import type { ApplicationService } from '../services/application.ts';
export function applicationRoutes(service:ApplicationService){const routes=new Hono();routes.get('/health',c=>c.json(service.health()));routes.get('/ready',c=>c.json(service.ready()));routes.get('/app/info',c=>c.json(service.info()));return routes;}
