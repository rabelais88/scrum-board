import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate, formatDuration, joinClass } from '../utils';
import Layout from './components/Layout';
import { dispatchWin } from './utils';
import { useAppStore, useScrum } from './utils/store';
import IconBack from './components/IconBack';

const StateBadge = ({
  taskState,
  className,
  onChange,
}: {
  taskState: TaskState;
  onChange: (ts: TaskState) => void;
} & PropsWithClass) => {
  const mapLabel: Record<TaskState, string> = {
    idle: '💤',
    wip: '🛠️',
    done: '✅',
    block: '🚨',
  };
  return (
    <select
      className={joinClass(
        'appearance-none focus:outline-none',
        'bg-slate-300 px-1 py-0.5 rounded-sm font-semibold text-xs',
        'data-[state=idle]:bg-slate-300 data-[state=idle]:text-slate-800',
        'data-[state=wip]:bg-blue-300 data-[state=wip]:text-blue-800',
        'data-[state=done]:bg-green-300 data-[state=done]:text-green-800',
        'data-[state=block]:bg-red-400 data-[state=block]:text-red-800',
        className
      )}
      data-state={taskState}
      value={taskState}
      // @ts-ignore
      onChange={(ev) => onChange(ev.target.value)}
    >
      <option value="idle">{mapLabel.idle}</option>
      <option value="wip">{mapLabel.wip}</option>
      <option value="done">{mapLabel.done}</option>
      <option value="block">{mapLabel.block}</option>
    </select>
  );
};

const TaskItem = ({ task }: { task: TaskData }) => {
  const params = useParams();
  const scrumId = Number(params.scrumId ?? '0');
  const { modifyTask, store, setTaskNow } = useAppStore();
  const taskState = useMemo(() => task.state, [task]);
  return (
    <tr
      data-finished={task?.state === 'done'}
      className="data-[finished=true]:line-through [&_th]:text-left"
    >
      <th>
        <StateBadge
          taskState={taskState}
          onChange={(ts) => modifyTask({ id: task.id, state: ts })}
        />
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
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/')}>
            <IconBack />
          </button>
          <span data-window-drag className="flex-1">
            {formatDate(scrum?.startAt ?? '')}
          </span>
        </div>
      }
    >
      <table className="w-full text-xs">
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
