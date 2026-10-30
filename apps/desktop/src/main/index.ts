import { app,ipcMain,protocol,net,dialog } from 'electron';
import { join,resolve,sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { apiPathSchema } from '@recall/contracts';
import { startBackend } from '../../../../scripts/backend-manager.mjs';
import { createWindow } from './window.ts';
import { isTrustedApplicationUrl,isTrustedIpcSender } from './security.ts';
protocol.registerSchemesAsPrivileged([{scheme:'recall',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
const development=!app.isPackaged;
if(development&&process.env.RECALL_TEST_USER_DATA)app.setPath('userData',resolve(process.env.RECALL_TEST_USER_DATA));
const devUrl=development?process.env.RECALL_DEV_URL:undefined;
if(devUrl){const url=new URL(devUrl);if(url.protocol!=='http:'||url.hostname!=='localhost'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Only a localhost development URL is permitted');}
const trustedUrl=devUrl??'recall://app/index.html';
function trusted(value:string){return isTrustedApplicationUrl(value,trustedUrl,Boolean(devUrl));}
let backend:Awaited<ReturnType<typeof startBackend>>|undefined;let window:ReturnType<typeof createWindow>|undefined;let shutdown=false;
if(!app.requestSingleInstanceLock())app.quit();
else {
 app.on('second-instance',()=>{window?.show();window?.focus();});
 app.on('before-quit',event=>{if(shutdown)return;event.preventDefault();shutdown=true;void (async()=>{try{await backend?.stop();}catch{dialog.showErrorBox('Recall shutdown issue','The backend did not exit cleanly. Check for a remaining Recall process before restarting.');}finally{app.quit();}})();});
 app.on('window-all-closed',()=>app.quit());
 app.whenReady().then(async()=>{
  const data=app.getPath('userData');
  backend=await startBackend({executable:process.execPath,entry:app.isPackaged?join(process.resourcesPath,'api/index.cjs'):join(__dirname,'api/index.cjs'),electron:true,env:{NODE_ENV:app.isPackaged?'production':'development',APP_NAME:'Recall',APP_VERSION:app.getVersion(),DEPLOYMENT_MODE:'local',API_PORT:'0',DATABASE_PATH:join(data,'recall.db'),STORAGE_PATH:join(data,'storage')}});
  backend.onUnexpectedExit(()=>{dialog.showErrorBox('Recall service stopped','The local backend exited unexpectedly. Close and restart Recall.');app.quit();});
  if(shutdown){await backend.stop();return;}
  const webRoot=app.isPackaged?join(process.resourcesPath,'web'):resolve(__dirname,'../../web/dist');
  protocol.handle('recall',request=>{try{const url=new URL(request.url);const path=resolve(webRoot,'.'+decodeURIComponent(url.pathname));if(url.host!=='app'||!path.startsWith(webRoot+sep))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(path).toString());}catch{return new Response('Invalid path',{status:400});}});
  window=createWindow(join(__dirname,'preload.cjs'));
  window.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));window.webContents.session.setPermissionCheckHandler(()=>false);
  window.webContents.on('will-navigate',(event,url)=>{if(!trusted(url))event.preventDefault();});window.webContents.on('will-redirect',(event,url)=>{if(!trusted(url))event.preventDefault();});
  function validateSender(event:Electron.IpcMainInvokeEvent){if(!window||!isTrustedIpcSender(event,window.webContents,trustedUrl,Boolean(devUrl)))throw new Error('Untrusted application frame');}
  ipcMain.handle('recall:runtime',(event,...args:unknown[])=>{validateSender(event);z.tuple([]).parse(args);return {platform:'desktop',appVersion:app.getVersion(),apiBaseUrl:backend?.baseUrl??'',capabilities:{desktopShell:true,localFileAccess:false}};});
  ipcMain.handle('recall:read',async(event,...args:unknown[])=>{validateSender(event);const [path]=z.tuple([apiPathSchema]).parse(args);try{if(!backend)throw new Error('Unavailable');const response=await fetch(backend.baseUrl+path,{headers:{authorization:'Bearer '+backend.token},signal:AbortSignal.timeout(5000)});if(!response.ok)throw new Error('Unavailable');return await response.json() as unknown;}catch{throw new Error('The local service is unavailable. Restart Recall.');}});
  window.once('ready-to-show',()=>window?.show());await window.loadURL(trustedUrl);
 }).catch(()=>{dialog.showErrorBox('Recall could not start','Check that Recall can write to its user-data folder and that the desktop build includes the API and web assets. No database reset has been performed.');app.quit();});
}
