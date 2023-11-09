import {
  InputHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addDiff,
  formatDate,
  formatDuration,
  formatTimeOnly,
  getDayEnd,
  getDayStart,
  getDiff,
  joinClass,
  parseDuration,
  validDuration,
} from '../utils';
import DurationControl from './components/DurationControl';
import IconBack from './components/IconBack';
import InputControl from './components/InputControl';
import Layout from './components/Layout';
import { useAppStore, useScrum } from './utils/store';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';

function AddTask() {
  const params = useParams();
  const { addTaskToScrum } = useAppStore();
  const scrumId = Number(params.scrumId ?? '0');
  const defaultValues: Omit<TaskData, 'id' | 'finished' | 'childTasksId'> = {
    title: '',
    durationMS: 30 * 60 * 1_000,
  };
  const { control, handleSubmit } = useForm({ defaultValues });
  const onAddTask = (task: typeof defaultValues) => {
    console.log('adding task', task);
    addTaskToScrum(scrumId, task);
  };
  return (
    <div className="flex gap-2">
      <InputControl control={control} name="title" placeholder="작업명" />
      <div className="relative before:content-['⌛'] before:absolute before:-translate-y-[50%] before:top-[50%]">
        <DurationControl
          control={control}
          name="durationMS"
          className="pl-[20px] w-[100px]"
        />
      </div>
      <CustomButton onClick={handleSubmit(onAddTask)}>➕</CustomButton>
    </div>
  );
}

const TaskItem = ({ task: t }: { task: TaskData }) => {
  const {
    toggleFinishTask,
    removeTaskFromScrum,
    modifyTask,
    store,
    setTaskNow,
  } = useAppStore();
  const params = useParams();
  const scrumId = Number(params.scrumId ?? '0');
  const [strDur, setStrDur] = useState(formatDuration(t?.durationMS ?? 0));
  const validDur = useMemo(() => validDuration(strDur), [strDur]);
  useEffect(() => {
    if (validDur) {
      modifyTask({ id: t.id, durationMS: parseDuration(strDur) });
    }
  }, [validDur, strDur]);
  return (
    <tr
      key={t?.id}
      data-id={t?.id}
      data-finished={t?.finished}
      className="data-[finished=true]:line-through"
    >
      <td>
        <CustomButton onClick={() => toggleFinishTask(t?.id ?? 0)}>
          ⛳
        </CustomButton>
      </td>
      <td
        data-active={store.taskNowId === t?.id}
        className="data-[active=true]:font-bold data-[active=true]:text-red-200"
      >
        {t?.title}
      </td>
      <td>
        <CustomInput
          data-valid={validDur}
          className="data-[valid=false]:text-red-500"
          value={strDur}
          onChange={(ev) => setStrDur(ev.target.value)}
        />
      </td>
      <td>
        <CustomButton onClick={() => removeTaskFromScrum(scrumId, t?.id ?? 0)}>
          ❌
        </CustomButton>
      </td>
      <td>
        <CustomButton
          onClick={() => setTaskNow(t?.id)}
          disabled={t?.id === store.taskNowId}
        >
          🏃‍♂️
        </CustomButton>
      </td>
    </tr>
  );
};

export default function ScrumPage() {
  const { getTaskById, modifyScrum, setBlockNote, setPrevNote } = useAppStore();
  const params = useParams();
  const scrumId = Number(params.scrumId ?? '0');
  const nav = useNavigate();
  const scrum = useScrum(scrumId);
  const tasks = (scrum?.tasksId ?? []).map(getTaskById);
  const totalUsedDuration = tasks.reduce(
    (ac, cv) => ac + (cv?.durationMS ?? 0),
    0
  );
  const availDuration = getDiff(scrum?.startAt ?? '', scrum?.endAt ?? '');
  const [strStart, setStrStart] = useState(
    formatTimeOnly(scrum?.startAt ?? new Date())
  );
  const [strEnd, setStrEnd] = useState(
    formatTimeOnly(scrum?.endAt ?? getDayEnd(new Date()))
  );
  useEffect(() => {
    if (
      validDuration(strStart) &&
      formatTimeOnly(scrum?.startAt ?? new Date()) !== strStart
    ) {
      modifyScrum({
        id: scrumId,
        startAt: addDiff(
          getDayStart(scrum?.startAt ?? new Date()),
          parseDuration(strStart)
        ),
      });
    }
  }, [strStart]);
  useEffect(() => {
    if (
      validDuration(strEnd) &&
      formatTimeOnly(scrum?.endAt ?? new Date()) !== strEnd
    ) {
      modifyScrum({
        id: scrumId,
        startAt: addDiff(
          getDayStart(scrum?.endAt ?? new Date()),
          parseDuration(strEnd)
        ),
      });
    }
  }, [strEnd]);
  return (
    <Layout
      className="flex flex-col gap-2"
      title={
        <>
          <CustomButton onClick={() => nav('/')} className="mr-2">
            <span className="sr-only">뒤로가기</span>
            <IconBack />
          </CustomButton>
          <span>SCM-{scrumId}</span>
        </>
      }
    >
      <label
        htmlFor="message"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        What did you do yesterday?
      </label>
      <textarea
        id="message"
        rows="4"
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={scrum?.blockNote}
        onChange={(ev) => setPrevNote(scrumId, ev.target.value)}
        placeholder="Write your thoughts here..."
      />
      <label
        htmlFor="message"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        What might cause block?
      </label>
      <textarea
        id="message"
        rows="4"
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={scrum?.blockNote}
        onChange={(ev) => setBlockNote(scrumId, ev.target.value)}
        placeholder="Write your thoughts here..."
      />
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 [&>tr]:h-[50px]">
            <tr>
              <th>start</th>
              <td className="flex items-center gap-2">
                {formatDate(scrum?.startAt ?? '')}{' '}
                <CustomInput
                  value={strStart}
                  onChange={(ev) => setStrStart(ev.target.value)}
                  className="w-[100px]"
                />
              </td>
            </tr>
            <tr>
              <th>end</th>
              <td>
                <CustomInput
                  className="w-[100px]"
                  value={strEnd}
                  onChange={(ev) => setStrEnd(ev.target.value)}
                />
              </td>
            </tr>
            <tr>
              <th>avail time</th>
              <td>{formatDuration(availDuration)}</td>
            </tr>
            <tr>
              <th>used time</th>
              <td>{formatDuration(totalUsedDuration)}</td>
            </tr>
            <tr>
              <th>remain time</th>
              <td>{formatDuration(availDuration - totalUsedDuration)}</td>
            </tr>
          </thead>
        </table>
      </div>
      <AddTask />
      <div className="relative overflow-x-auto sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="w-[70px]">finished</th>
              <th>name</th>
              <th>duration</th>
              <th colSpan={2}>edit</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <TaskItem key={t?.id} task={t as TaskData} />
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
