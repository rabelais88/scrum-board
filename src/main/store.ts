import Store from 'electron-store';

export const store = new Store();

export const setData = <T extends keyof StoreDataMap>(
  key: T,
  val: StoreDataMap[T],
) => {
  return store.set(key as string, val);
};

export const getData = <T extends keyof StoreDataMap>(key: T) => {
  return store.get(key as string) as StoreDataMap[T];
};

