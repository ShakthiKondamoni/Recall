import { z } from 'zod';
export const envSchema=z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'),
 APP_NAME:z.string().min(1).default('Recall'),APP_VERSION:z.string().regex(/^\d+\.\d+\.\d+$/).default('0.1.0'),
 DEPLOYMENT_MODE:z.literal('local').default('local'),
 API_PORT:z.coerce.number().int().min(0).max(65535).default(8787),
 DATABASE_PATH:z.string().min(1).default('./data/recall.db'),STORAGE_PATH:z.string().min(1).default('./data/storage'),
 LOG_LEVEL:z.enum(['debug','info','warn','error']).default('info'),
 RECALL_RUNTIME_TOKEN:z.string().min(32,'Launch through corepack pnpm dev:web or corepack pnpm dev:desktop; a session credential is required'),
});
export type Config=z.infer<typeof envSchema>;
export function parseConfig(input:Record<string,unknown>):Config {const result=envSchema.safeParse(input);if(!result.success)throw new Error('Invalid configuration: '+result.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));return result.data;}
