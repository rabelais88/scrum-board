import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate, formatDuration } from '../utils';
import Layout from './components/Layout';
import { dispatchWin } from './utils';
import { useAppStore, useScrum } from './utils/store';
import IconBack from './components/IconBack';

const TaskItem = ({ task }: { task: TaskData }) => {
  const params = useParams();
  const scrumId = Number(params.scrumId ?? '0');
  const { modifyTask, store, setTaskNow } = useAppStore();
  const taskState = useMemo(() => {
    if (task.finished) return 'finished';
    if (task.id === store.taskNowId) return 'working';
    return 'idle';
  }, [task, store]);
  return (
    <tr
      data-finished={task.finished}
      className="data-[finished=true]:line-through [&_th]:text-left"
    >
      <th>
        {taskState === 'idle' && (
          <input
            type="checkbox"
            // @ts-ignore
            defaultChecked={false}
            onClick={() => setTaskNow(task.id)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        )}
        {taskState === 'working' && (
          <button onClick={() => modifyTask({ id: task.id, finished: true })}>
            🛠️
          </button>
        )}
        {taskState === 'finished' && (
          <input
            type="checkbox"
            // @ts-ignore
            defaultChecked
            onClick={() => modifyTask({ id: task.id, finished: false })}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        )}
      </th>
      <th>{task.title}</th>
      <td>{formatDuration(task.durationMS)}</td>
    </tr>
  );
};

const ScrumMiniPage = () => {
  const params = useParams();
  const scrumId = Number(params.scrumId ?? '0');
  const scrum = useScrum(scrumId);
  const { getTaskById, modifyScrum, setBlockNote, setPrevNote } = useAppStore();
  const tasks = (scrum?.tasksId ?? []).map(getTaskById);
  const navigate = useNavigate();
  useEffect(() => {
    dispatchWin('win-size', 'mini');
  }, []);
  return (
    <Layout
      title={
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')}>
            <IconBack />
          </button>
          <span data-window-drag className="flex-1">
            {formatDate(scrum?.startAt ?? '')}
          </span>
        </div>
      }
    >
      <table className="w-full">
        <tbody>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default ScrumMiniPage;
