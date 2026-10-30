import type { DesktopBridge } from '@recall/contracts';

declare global {
  interface Window {
    recall?: DesktopBridge;
  }
}

export {};
