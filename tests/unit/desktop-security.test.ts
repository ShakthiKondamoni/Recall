import { expect,test } from 'vitest';
import { createMainWindowOptions } from '../../apps/desktop/src/main/window-config.ts';
import { denyNewWindow,isTrustedApplicationUrl,isTrustedIpcSender } from '../../apps/desktop/src/main/security.ts';

test('main BrowserWindow options keep the renderer isolated and sandboxed',()=>{
  const options=createMainWindowOptions('C:\\Recall\\preload.cjs');
  expect(options.webPreferences).toEqual({contextIsolation:true,nodeIntegration:false,sandbox:true,preload:'C:\\Recall\\preload.cjs',webSecurity:true});
});

test('navigation policy accepts only the configured application origin and packaged entry',()=>{
  const packaged='recall://app/index.html';
  expect(isTrustedApplicationUrl(packaged,packaged,false)).toBe(true);
  expect(isTrustedApplicationUrl('recall://evil/index.html',packaged,false)).toBe(false);
  expect(isTrustedApplicationUrl('recall://app/other.html',packaged,false)).toBe(false);
  const development='http://localhost:5173/';
  expect(isTrustedApplicationUrl('http://localhost:5173/settings',development,true)).toBe(true);
  expect(isTrustedApplicationUrl('http://localhost.evil.test:5173/settings',development,true)).toBe(false);
});

test('popup policy denies new windows',()=>{
  expect(denyNewWindow()).toEqual({action:'deny'});
});

test('IPC policy requires the exact main WebContents, main frame, and trusted URL',()=>{
  const mainFrame={url:'recall://app/index.html'};
  const contents={mainFrame};
  const trustedEvent={sender:contents,senderFrame:mainFrame};
  expect(isTrustedIpcSender(trustedEvent,contents,'recall://app/index.html',false)).toBe(true);
  expect(isTrustedIpcSender({...trustedEvent,sender:{}},contents,'recall://app/index.html',false)).toBe(false);
  expect(isTrustedIpcSender({...trustedEvent,senderFrame:{url:'recall://app/index.html'}},contents,'recall://app/index.html',false)).toBe(false);
  const externalFrame={url:'https://example.invalid/'};
  const externalContents={mainFrame:externalFrame};
  expect(isTrustedIpcSender({sender:externalContents,senderFrame:externalFrame},externalContents,'recall://app/index.html',false)).toBe(false);
  expect(isTrustedIpcSender({...trustedEvent,senderFrame:null},contents,'recall://app/index.html',false)).toBe(false);
});
