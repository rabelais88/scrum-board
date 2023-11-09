export const setDataWin = <T extends keyof StoreDataMap>(
  key: T,
  val: StoreDataMap[T],
) => {
  return window?.electron.store.set(key, val);
};

export const getDataWin = <T extends keyof StoreDataMap>(key: T) => {
  return window.electron.store.get(key) as StoreDataMap[T];
};

export const dispatchWin = <K extends keyof ChannelMap>(key: K, ...args: ChannelMap[K]) => {
  return window.electron.ipcRenderer.sendMessage(key, ...args)
}


// jotai로 구현하기
// export const useStoreData = <K extends keyof StoreDataMap>(key: K, defaultValue: StoreDataMap[K]) => {
//   const [value, setValue] = useState(defaultValue)
//   useEffect(() => {
//     setValue(getDataWin(key))
//   }, [])
//   return {value, }
// }
