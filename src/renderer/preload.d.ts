import { ElectronHandler } from '../main/preload';

declare global {
  interface Window {
    electron: ElectronHandler & {
      store: {
        get: <T extends keyof StoreDataMap>(key: T) => StoreDataMap[T];
        set: <T extends keyof StoreDataMap>(key: T, val: StoreDataMap[T]) => void;
      };
    };
  }
}

export { };
