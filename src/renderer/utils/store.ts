import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useMemo } from 'react';
import { dispatchWin, getDataWin, setDataWin } from '.';
import {
  cutSeconds,
  getDayEnd,
  getMonth,
  setMonth,
  storeDefault,
} from '../../utils';
import dayjs from 'dayjs';

const atomStore = atomWithStorage('store', storeDefault, {
  getItem(key, initialValue) {
    return getDataWin(key) ?? initialValue;
  },
  setItem(key, value) {
    return setDataWin(key, value);
  },
  removeItem(key) {
    // blank
  },
});

export const useAppStore = () => {
  const [store, setStore] = useAtom(atomStore);
  const scrums = useMemo(() => store.scrums ?? [], [store.scrums]);
  const sortedScrums = useMemo(
    () => [...scrums].sort((a, b) => b.id - a.id),
    [scrums]
  );
  const scrumIdIdxMap = useMemo(() => {
    const m = new Map<number, number>();
    scrums.forEach((s, i) => m.set(s.id, i));
    return m;
  }, [scrums]);
  const tasks = useMemo(() => store.tasks ?? [], [store.tasks]);
  const taskIdIdxMap = useMemo(() => {
    const m = new Map<number, number>();
    tasks.forEach((t, i) => m.set(t.id, i));
    return m;
  }, [tasks]);
  const mergeSettings = (newStore: Partial<SettingsData>) => {
    setStore({ ...store, settings: { ...store.settings, ...newStore } });
  };
  const setAlwaysOnTop = (alwaysOnTop: boolean) => {
    mergeSettings({ alwaysOnTop });
    dispatchWin('always-on-top', alwaysOnTop);
  };
  const toggleAlwaysOnTop = () => {
    const newVal = !store.settings.alwaysOnTop;
    setAlwaysOnTop(newVal);
  };
  const addTask = (
    task: Omit<TaskData, 'id' | 'finished' | 'childTasksId'>
  ) => {
    const tasksId = [0, ...tasks.map((t) => t.id)];
    const newTaskId = Math.max(...tasksId) + 1;
    const newTask: TaskData = {
      ...task,
      id: newTaskId,
      finished: false,
      childTasksId: [],
      state: 'idle',
    };
    console.log('new task', newTask);
    setStore({ ...store, tasks: [...tasks, newTask] });
    return newTask;
  };
  const removeTask = (taskId: number) => {
    const newTasks = tasks.filter((t) => t.id !== taskId);
    setStore({ ...store, tasks: newTasks });
  };
  const removeTaskFromScrum = (scrumId: number, taskId: number) => {
    const newTasks = tasks.filter((t) => t.id !== taskId);
    const scrumIdx = scrumIdIdxMap.get(scrumId);
    if (scrumIdx === undefined) return;
    const oldScrum = scrums[scrumIdx];
    const newTasksId = oldScrum.tasksId.filter((tid) => tid !== taskId);
    const newScrums = [...scrums];
    newScrums[scrumIdx] = { ...oldScrum, tasksId: newTasksId };
    setStore({ ...store, tasks: newTasks, scrums: newScrums });
  };
  const modifyTask = (task: Partial<TaskData> & Pick<TaskData, 'id'>) => {
    const taskIdx = taskIdIdxMap.get(task.id);
    if (taskIdx === undefined) return;
    const newTask = { ...tasks[taskIdx], ...task };
    const newTasks = [...tasks];
    newTasks[taskIdx] = newTask;
    setStore({ ...store, tasks: newTasks });
    return newTask;
  };
  const addScrum = () => {
    const scrumsId = [0, ...scrums.map((s) => s.id)];
    const newScrumId = Math.max(...scrumsId) + 1;
    const newScrum: ScrumData = {
      id: newScrumId,
      startAt: cutSeconds(new Date()),
      endAt: getDayEnd(new Date()),
      tasksId: [],
      blockNote: '',
      prevNote: '',
    };
    const newScrums = [...scrums, newScrum];
    setStore({ ...store, scrums: newScrums });
  };

  const modifyScrum = (scrum: Partial<ScrumData> & Pick<ScrumData, 'id'>) => {
    const scrumIdx = scrumIdIdxMap.get(scrum.id);
    if (scrumIdx === undefined) return;
    const oldScrum = scrums[scrumIdx];
    const newScrums = [...scrums];
    newScrums[scrumIdx] = { ...oldScrum, ...scrum };
    setStore({ ...store, scrums: newScrums });
  };

  const addTaskToScrum = (
    scrumId: number,
    task: Parameters<typeof addTask>[0]
  ) => {
    const scrumIdx = scrumIdIdxMap.get(scrumId);
    if (scrumIdx === undefined) return;
    const tasksId = [0, ...tasks.map((t) => t.id)];
    const newTaskId = Math.max(...tasksId) + 1;
    const newTask: TaskData = {
      ...task,
      id: newTaskId,
      finished: false,
      childTasksId: [],
    };
    const scrum = scrums[scrumIdx];
    const newScrums = [...scrums];
    newScrums[scrumIdx] = { ...scrum, tasksId: [...scrum.tasksId, newTask.id] };
    setStore({ ...store, tasks: [...tasks, newTask], scrums: newScrums });
  };

  const getTaskById = (taskId: number) => {
    const taskIdx = taskIdIdxMap.get(taskId);
    if (taskIdx === undefined) return;
    return tasks[taskIdx];
  };
  const toggleFinishTask = (taskId: number) => {
    const taskIdx = taskIdIdxMap.get(taskId);
    if (taskIdx === undefined) return;
    const newTasks = [...tasks];
    const oldTask = tasks[taskIdx];
    newTasks[taskIdx] = { ...oldTask, finished: !oldTask.finished };
    setStore({ ...store, tasks: newTasks });
  };

  const setTaskNow = (taskId: number) => {
    setStore({ ...store, taskNowId: taskId });
  };

  const setPrevNote = (scrumId: number, prevNote: string) => {
    const scrumIdx = scrumIdIdxMap.get(scrumId);
    if (scrumIdx === undefined) return;
    const newScrum = { ...scrums[scrumIdx], prevNote };
    const newScrums = [...scrums];
    newScrums[scrumIdx] = newScrum;
    setStore({ ...store, scrums: newScrums });
  };

  const setBlockNote = (scrumId: number, blockNote: string) => {
    const scrumIdx = scrumIdIdxMap.get(scrumId);
    if (scrumIdx === undefined) return;
    const newScrum = { ...scrums[scrumIdx], blockNote };
    const newScrums = [...scrums];
    newScrums[scrumIdx] = newScrum;
    setStore({ ...store, scrums: newScrums });
  };

  return {
    store,
    setStore,
    setAlwaysOnTop,
    toggleAlwaysOnTop,
    addTask,
    removeTask,
    modifyTask,
    modifyScrum,
    addScrum,
    scrums,
    tasks,
    addTaskToScrum,
    getTaskById,
    removeTaskFromScrum,
    toggleFinishTask,
    sortedScrums,
    setTaskNow,
    setPrevNote,
    setBlockNote,
  };
};

export const useScrum = (scrumId: number) => {
  const atomScrum = useMemo(
    () =>
      atom((get) =>
        (get(atomStore)?.scrums ?? []).find((s) => s.id === scrumId)
      ),
    [scrumId]
  );
  const [scrum] = useAtom(atomScrum);
  return scrum;
};

const atomScrumDetailShow = atom(true);
export const useScrumDetailShow = () => {
  const [scrumDetailShow, setScrumDetailShow] = useAtom(atomScrumDetailShow);
  return { scrumDetailShow, setScrumDetailShow };
};

export const atomMonthViewCursor = atom(
  dayjs(new Date()).startOf('month').toDate()
);
export const useMonthView = () => {
  const [monthViewCursor, setMonthViewCursor] = useAtom(atomMonthViewCursor);
  const viewMonth = useMemo(() => getMonth(monthViewCursor), [monthViewCursor]);
  const setViewMonth = (month: number) => {
    setMonthViewCursor(setMonth(monthViewCursor, month));
  };
  return { viewMonth, setViewMonth, monthViewCursor };
};

export const atomScrumHintId = atom(-1);
export const atomScrumHintPos = atom([0, 0]);
export const useScrumHint = () => {
  const [scrumHintId, setScrumHintId] = useAtom(atomScrumHintId);
  const [scrumHintPos, setScrumHintPos] = useAtom(atomScrumHintPos);
  return { scrumHintId, setScrumHintId, setScrumHintPos, scrumHintPos };
};
