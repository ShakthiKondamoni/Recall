export interface MainFrameLike { readonly url:string }
export interface MainWebContentsLike { readonly mainFrame:MainFrameLike }
export interface IpcSenderEventLike { readonly sender:unknown; readonly senderFrame:MainFrameLike|null }

export function isTrustedApplicationUrl(value:string,trustedUrl:string,allowSubpaths:boolean):boolean {
  try {
    const valueUrl=new URL(value);
    const target=new URL(trustedUrl);
    return valueUrl.origin===target.origin && valueUrl.protocol===target.protocol && valueUrl.host===target.host && Boolean(allowSubpaths || valueUrl.pathname==='/index.html');
  } catch { return false; }
}

export function isTrustedIpcSender(event:IpcSenderEventLike,expectedSender:MainWebContentsLike,trustedUrl:string,allowSubpaths:boolean):boolean {
  const frame=event.senderFrame;
  if(event.sender!==expectedSender || !frame || frame!==expectedSender.mainFrame) return false;
  return isTrustedApplicationUrl(frame.url,trustedUrl,allowSubpaths);
}

export function denyNewWindow():{action:'deny'} {
  return {action:'deny'};
}
