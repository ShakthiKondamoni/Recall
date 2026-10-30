import { contextBridge,ipcRenderer } from 'electron';
import type { DesktopBridge } from '@recall/contracts';
const bridge:DesktopBridge={runtime:()=>ipcRenderer.invoke('recall:runtime'),read:path=>ipcRenderer.invoke('recall:read',path)};
contextBridge.exposeInMainWorld('recall',Object.freeze(bridge));
