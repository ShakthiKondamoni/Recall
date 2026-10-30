import { test,expect,_electron as electron } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { join,resolve } from 'node:path';
test('Electron runtime, isolation, narrow preload bridge, themes, API readiness and shutdown',async()=>{
  const data=mkdtempSync(join(process.cwd(),'desktop-test-'));
  const app=await electron.launch({args:[resolve('apps/desktop')],env:{...process.env,RECALL_DEV_URL:'',RECALL_TEST_USER_DATA:data}});
  let baseUrl='';
  try {
   const page=await app.firstWindow();await expect(page.getByRole('heading',{name:/Make room/})).toBeVisible();
   expect(await page.evaluate(()=>typeof Reflect.get(globalThis,'require'))).toBe('undefined');
   expect(await page.evaluate(()=>Object.keys(window.recall??{}).sort())).toEqual(['read','runtime']);
   const runtime=await page.evaluate(()=>window.recall!.runtime());expect(runtime.platform).toBe('desktop');baseUrl=runtime.apiBaseUrl;
   expect(await page.evaluate(()=>window.recall!.read('/api/ready'))).toMatchObject({status:'ready'});
   await expect(page.evaluate(()=>window.recall!.read('/api/arbitrary' as '/api/health'))).rejects.toThrow();
   await page.getByRole('link',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:/^Dusk/}).click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dusk');
  } finally {await app.close();}
  await expect(fetch(baseUrl+'/api/health',{signal:AbortSignal.timeout(3000)})).rejects.toThrow();
});