declare interface PropsWithClass {className?: string}

declare interface TaskData {
  id: number;
  title: string;
  durationMS: number;
  finished: boolean;
  childTasksId: number[];
}

declare interface ScrumData {
  id: number;
  tasksId: TaskData['id'][];
  startAt: Date;
  endAt: Date;
  prevNote: string;
  blockNote: string;
}

declare interface SettingsData {
  alwaysOnTop: boolean;
}

declare interface StoreDataMap extends Record<string,any>{
  settings: SettingsData;
  scrums: ScrumData[];
  tasks: TaskData[];
  taskNowId: number;
}


declare interface ChannelMap<SK extends keyof StoreDataMap = keyof StoreDataMap> {
  'ipc-example': []
  'electron-store-get': [SK];
  'electron-store-set': [SK, StoreDataMap[SK]];
  'always-on-top': [boolean]
}
