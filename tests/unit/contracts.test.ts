import { describe,it,expect } from 'vitest';
import { parseConfig } from '../../apps/api/src/config/env.ts';
import { apiPathSchema,themeSchema } from '../../packages/contracts/src/index.ts';
describe('configuration and contracts',()=>{
 it('fails without a runtime-generated credential',()=>expect(()=>parseConfig({})).toThrow(/RECALL_RUNTIME_TOKEN/));
 it('rejects unsupported deployment modes',()=>expect(()=>parseConfig({DEPLOYMENT_MODE:'cloud',RECALL_RUNTIME_TOKEN:'x'.repeat(64)})).toThrow());
 it('rejects invalid ports',()=>expect(()=>parseConfig({API_PORT:'invalid',RECALL_RUNTIME_TOKEN:'x'.repeat(64)})).toThrow());
 it('accepts six themes and rejects unknown values',()=>{for(const value of ['paper','operator','glass','graphite','soft','dusk'])expect(themeSchema.parse(value)).toBe(value);expect(themeSchema.safeParse('unknown').success).toBe(false);});
 it('does not expose arbitrary IPC API paths',()=>expect(apiPathSchema.safeParse('/api/secrets').success).toBe(false));
});
