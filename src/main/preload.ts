// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const electronHandler = {
  ipcRenderer: {
    sendMessage<K extends keyof ChannelMap>(channel: K, ...args: ChannelMap[K]) {
      ipcRenderer.send(channel, ...args);
    },
    on<K extends keyof ChannelMap>(channel: K, func: (...args: ChannelMap[K]) => void) {
      const subscription = (_event: IpcRendererEvent, ..._args: any[]) =>
        func(..._args as ChannelMap[K]);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once<K extends keyof ChannelMap>(channel: K, func: (...args: ChannelMap[K]) => void) {
      ipcRenderer.once(channel, (_event, ..._args) => func(..._args as ChannelMap[K]));
    },
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
