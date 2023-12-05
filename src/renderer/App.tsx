import * as d3 from 'd3';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import {
  Route,
  MemoryRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {
  formatDate,
  formatDuration,
  formatTimeOnly,
  getDate,
  getDaysInMonth,
  getDiff,
  getMonth,
  getWeek,
  getWeekday,
} from '../utils';
import ScrumMiniPage from './ScrumMiniPage';
import ScrumPage from './ScrumPage';
import CustomButton from './components/CustomButton';
import Layout from './components/Layout';
import './main.css';
import { dispatchWin } from './utils';
import { useAppStore, useMonthView } from './utils/store';

const DateCell = ({ scrums, date }: { scrums: ScrumData[]; date?: Date }) => {
  const monthDate = useMemo(() => getDate(date), [date]);
  const nav = useNavigate();
  const [hover, setHover] = useState(false);
  if (!date) return <div className="h-full min-h-[50px]" />;
  return (
    <div className="h-full min-h-[50px]">
      <div className="border-b">{monthDate}</div>
      {scrums.map((scrum) => (
        <button
          data-scrum-id={scrum.id}
          className="text-xs hover:bg-pink-300 px-1 py-[2px] rounded-sm"
          onClick={() => nav(`/scrum/${scrum.id}`)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          SCM-{scrum.id}
        </button>
      ))}
    </div>
  );
};

function AppMain() {
  const { addScrum, sortedScrums } = useAppStore();
  const nav = useNavigate();
  const { viewMonth, setViewMonth, monthViewCursor } = useMonthView();
  const mapScrums = useMemo(() => {
    return d3.group(
      sortedScrums,
      (s) => dayjs(s.startAt).get('year'),
      (s) => getMonth(s.startAt),
      (s) => getWeek(s.startAt),
      (s) => getWeekday(s.startAt)
    );
  }, [sortedScrums]);
  const scrumsNow = useMemo(
    () => mapScrums.get(dayjs(monthViewCursor).get('year'))?.get(viewMonth),
    [mapScrums, monthViewCursor, viewMonth]
  );
  const weekIndices = Array.from({ length: 5 }).map((_, i) => i + 1);
  const mapDaysInMonth = useMemo(() => {
    const days = d3.range(getDaysInMonth(monthViewCursor)).map((date) =>
      // 이상하게도 setDate를 쓰면 안맞음
      dayjs(monthViewCursor).startOf('month').add(date, 'days').toDate()
    );
    return d3.group(
      days,
      (d) => getWeek(d),
      (d) => getWeekday(d)
    );
  }, [monthViewCursor]);
  console.log({ mapDaysInMonth });
  const onPrevMonth = () => {
    setViewMonth(viewMonth - 1);
  };
  const onNextMonth = () => {
    setViewMonth(viewMonth + 1);
  };
  useEffect(() => {
    dispatchWin('win-size', 'normal');
  }, []);
  return (
    <Layout
      className="flex items-center flex-col"
      title={<span>Scrum Board</span>}
    >
      <CustomButton className="mb-10" onClick={addScrum}>
        add scrum
      </CustomButton>
      <div>
        <div className="flex justify-center items-center gap-2">
          <button onClick={onPrevMonth}>⬅️</button>
          <p>{dayjs(monthViewCursor).format('YYYY.MMM').toUpperCase()}</p>
          <button onClick={onNextMonth}>➡️</button>
        </div>
        <table className="h-[1px]">
          <thead className="[&_th]:w-16">
            <tr>
              <th>MON</th>
              <th>TUE</th>
              <th>WED</th>
              <th>THU</th>
              <th>FRI</th>
              <th>SAT</th>
              <th>SUN</th>
            </tr>
          </thead>
          <tbody>
            {weekIndices.map((weekIndex) => (
              <tr key={weekIndex} data-week={weekIndex}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <td key={i} data-week={weekIndex} data-weekday={i}>
                    <DateCell
                      date={mapDaysInMonth.get(weekIndex)?.get(i)?.[0]}
                      scrums={Array.from(
                        scrumsNow?.get(weekIndex)?.get(i) ?? []
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr className="[&>th]:px-6 [&>th]:py-3">
              <th>SCM-ID</th>
              <th>date</th>
              <th>start</th>
              <th>duration</th>
              <th>edit</th>
            </tr>
          </thead>
          <tbody>
            {sortedScrums.map((scrum) => (
              <tr key={scrum.id} className="[&>td]:px-6 [&>td]:py-4">
                {/* <CustomButton
                    onClick={() => nav(`/scrum/${scrum.id}`)}
                    className="flex gap-2"
                  > */}
                <td>SCM-{scrum.id}</td>
                <td>{formatDate(scrum.startAt)}</td>
                <td>{formatTimeOnly(scrum.startAt)}</td>
                <td>{formatDuration(getDiff(scrum.endAt, scrum.startAt))}</td>
                <td>
                  <button onClick={() => nav(`/scrum/${scrum.id}`)}>🔨</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppMain />} />
        <Route path="/scrum/:scrumId" element={<ScrumPage />} />
        <Route path="/scrum-mini/:scrumId" element={<ScrumMiniPage />} />
      </Routes>
    </Router>
  );
}
