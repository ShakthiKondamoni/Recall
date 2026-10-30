import { infoSchema,type DesktopBridge,type Runtime } from '@recall/contracts';
declare global { interface Window { recall?:DesktopBridge } }
export async function createRuntime():Promise<Runtime>{
 if(window.recall){const bridge=window.recall;return {info:await bridge.runtime(),read:path=>bridge.read(path)};}
 return {info:{platform:'web',appVersion:'0.1.0',apiBaseUrl:'/api',capabilities:{desktopShell:false,localFileAccess:false}},async read(path,signal){const response=await fetch(path,{...(signal?{signal}:{}),credentials:'same-origin'});if(!response.ok)throw new Error(response.status===401?'Your local session is unavailable. Restart Recall.':'The local service is unavailable. Check that the API is running.');return response.json() as Promise<unknown>;}};
}
export async function readAppInfo(runtime:Runtime,signal?:AbortSignal){return infoSchema.parse(await runtime.read('/api/app/info',signal));}
