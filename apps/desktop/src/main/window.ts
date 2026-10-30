import { BrowserWindow } from 'electron';
import { denyNewWindow } from './security.ts';
import { createMainWindowOptions } from './window-config.ts';
export function createWindow(preload:string){const window=new BrowserWindow(createMainWindowOptions(preload));window.webContents.setWindowOpenHandler(()=>denyNewWindow());return window;}
