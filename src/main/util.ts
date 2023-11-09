/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { IpcMainEvent, ipcMain, ipcRenderer } from "electron";

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}


export const dispatchIPC = <K extends keyof ChannelMap>(key: K, ...args: ChannelMap[K]) => {
  return ipcRenderer.send(key, ...args)
}

export const onEventIPC = <K extends keyof ChannelMap>(key:K, func: (ev: IpcMainEvent, ...args: ChannelMap[K]) => Promise<void>) => {
  return ipcMain.on(key, (ev, ..._args) => {
    func(ev, ..._args as ChannelMap[K])
  });
}
