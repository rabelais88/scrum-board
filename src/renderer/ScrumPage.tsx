import dayjs from 'dayjs';
import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
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
import CustomButton from './components/CustomButton';
import CustomInput from './components/CustomInput';
import DurationControl from './components/DurationControl';
import IconBack from './components/IconBack';
import InputControl from './components/InputControl';
import Layout from './components/Layout';
import { dispatchWin } from './utils';
import { useAppStore, useScrum } from './utils/store';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS as dndCSS } from '@dnd-kit/utilities';
import { useFloating } from '@floating-ui/react';

function AddTask() {
  const params = useParams();
  const { addTaskToScrum } = useAppStore();
  const scrumId = Number(params.scrumId ?? '0');
  const defaultValues: Omit<TaskData, 'id' | 'finished' | 'childTasksId'> = {
    title: '',
    durationMS: 30 * 60 * 1_000,
    state: 'idle',
  };
  const { control, handleSubmit } = useForm({ defaultValues });
  const onAddTask = (task: typeof defaultValues) => {
    console.log('adding task', task);
    addTaskToScrum(scrumId, task);
  };
  return (
    <div className="flex gap-2">
      <InputControl
        control={control}
        name="title"
        placeholder="작업명"
        className="flex-1"
      />
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

const StateBadge = ({
  taskState,
  className,
  onChange,
}: {
  taskState: TaskState;
  onChange: (ts: TaskState) => void;
} & PropsWithClass) => {
  const mapLabel: Record<TaskState, string> = {
    idle: 'IDLE',
    wip: 'WIP',
    done: 'DONE',
    block: 'BLOCKED',
    fail: 'FAIL',
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
        'data-[state=fail]:bg-red-400 data-[state=fail]:text-red-800',
        className
      )}
      value={taskState}
      data-state={taskState}
      // @ts-ignore
      onChange={(ev) => onChange(ev.target.value)}
    >
      <option value="idle">{mapLabel.idle}</option>
      <option value="wip">{mapLabel.wip}</option>
      <option value="done">{mapLabel.done}</option>
      <option value="block">{mapLabel.block}</option>
      <option value="fail">{mapLabel.fail}</option>
    </select>
  );
};

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
  const taskState = useMemo(() => t.state, [t, store]);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: t.id });

  const style = {
    transform: dndCSS.Transform.toString(transform),
    transition,
  };
  useEffect(() => {
    if (validDur) {
      modifyTask({ id: t.id, durationMS: parseDuration(strDur) });
    }
  }, [validDur, strDur]);

  return (
    <tr
      ref={setNodeRef}
      key={t?.id}
      data-id={t?.id}
      data-finished={t?.state === 'done'}
      className="data-[finished=true]:line-through"
      style={style}
      {...attributes}
    >
      <td>
        <StateBadge
          taskState={taskState}
          onChange={(ts) => modifyTask({ id: t.id, state: ts })}
        />
      </td>
      <td
        data-active={store.taskNowId === t?.id}
        className="data-[active=true]:font-bold data-[active=true]:text-red-200"
        {...listeners}
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
        <CustomButton onClick={() => {}}>👇</CustomButton>
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
  const [tasksId, setTasksId] = useState([] as number[]);
  const totalUsedDuration = tasks.reduce(
    (ac, cv) => ac + (cv?.durationMS ?? 0),
    0
  );
  const availDuration = getDiff(scrum?.endAt ?? '', scrum?.startAt ?? '');
  const [strStart, setStrStart] = useState(
    formatTimeOnly(scrum?.startAt ?? new Date())
  );
  const [strEnd, setStrEnd] = useState(
    formatDuration(
      getDiff(
        scrum?.endAt ?? getDayEnd(new Date()),
        getDayStart(scrum?.startAt ?? new Date())
      )
    )
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (scrum?.tasksId) setTasksId(scrum.tasksId);
  }, [scrum?.tasksId]);

  useEffect(() => {
    if (validDuration(strStart)) {
      const isLater =
        getDayStart(scrum?.startAt ?? new Date()).getTime() >
        getDayEnd(scrum?.startAt ?? new Date()).getTime();
      if (isLater) return;
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
    const isLater =
      getDayEnd(scrum?.endAt ?? new Date()).getTime() >
      dayjs(scrum?.endAt)
        .add(1, 'days')
        .endOf('date')
        .toDate()
        .getTime();
    if (isLater) return;
    if (validDuration(strEnd)) {
      modifyScrum({
        id: scrumId,
        endAt: addDiff(
          getDayStart(scrum?.startAt ?? new Date()),
          parseDuration(strEnd)
        ),
      });
    }
  }, [strEnd]);
  useEffect(() => {
    dispatchWin('win-size', 'normal');
  }, []);

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;

    if (over?.id && active.id !== over.id) {
      // id가 number가 아닌 UniqueIdentifier라는 고유의 타입으로 되어있어 형변환을 해 주어야 함.
      const newTasksId = [...tasksId];
      const oldIndex = newTasksId.findIndex(
        (tid) => tid === (active.id as number)
      );
      const newIndex = newTasksId.findIndex(
        (tid) => tid === (over.id as number)
      );
      newTasksId[oldIndex] = over.id as number;
      newTasksId[newIndex] = active.id as number;
      modifyScrum({ id: scrum?.id as number, tasksId: newTasksId });
    }
  };

  return (
    <Layout
      className="flex flex-col gap-2 overflow-x-auto"
      title={
        <>
          <CustomButton onClick={() => nav('/')} className="mr-2">
            <span className="sr-only">뒤로가기</span>
            <IconBack />
          </CustomButton>
          <div data-window-drag>
            SCM-{scrumId} {formatDate(scrum?.startAt ?? new Date())}
          </div>
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
        rows={4}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={scrum?.prevNote}
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
        rows={4}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={scrum?.blockNote}
        onChange={(ev) => setBlockNote(scrumId, ev.target.value)}
        placeholder="Write your thoughts here..."
      />
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 [&>tr]:h-[50px] [&_th]:pl-4">
            <tr>
              <th>start</th>
              <td>
                <div className="flex gap-2 items-center">
                  <span className="w-[100px]">
                    {formatDate(scrum?.startAt ?? '')}
                  </span>
                  <CustomInput
                    value={strStart}
                    onChange={(ev) => setStrStart(ev.target.value)}
                    className="w-[100px]"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>end</th>
              <td>
                <div>
                  <span className="sr-only">
                    {formatDate(scrum?.endAt ?? '')}
                  </span>
                  <CustomInput
                    className="w-[100px]"
                    value={strEnd}
                    onChange={(ev) => setStrEnd(ev.target.value)}
                  />
                </div>
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
      <div className="relative sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 [&_th]:h-[50px]">
            <tr>
              <th className="w-[70px]">state</th>
              <th>name</th>
              <th>duration</th>
              <th colSpan={2}>edit</th>
            </tr>
          </thead>
          <tbody>
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
              <SortableContext
                items={tasksId}
                strategy={verticalListSortingStrategy}
              >
                {tasksId.map((t) =>
                  getTaskById(t) ? (
                    <TaskItem key={t} task={getTaskById(t) as TaskData} />
                  ) : (
                    <tr data-task-id={t} className="sr-only">
                      empty task
                    </tr>
                  )
                )}
                {tasksId.length === 0 && (
                  <tr>
                    <td colSpan={4}>no task registered</td>
                  </tr>
                )}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
