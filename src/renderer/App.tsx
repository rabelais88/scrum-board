import {
  Route,
  MemoryRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAppStore } from './utils/store';
import './main.css';
import ScrumPage from './ScrumPage';
import Layout from './components/Layout';
import { formatDate, formatDuration, formatTimeOnly, getDiff } from '../utils';
import CustomButton from './components/CustomButton';
import ScrumMiniPage from './ScrumMiniPage';
import { useEffect } from 'react';
import { dispatchWin } from './utils';

function Hello() {
  const { store, toggleAlwaysOnTop, addScrum, sortedScrums } = useAppStore();
  const nav = useNavigate();
  useEffect(() => {
    dispatchWin('win-size', 'normal');
  }, []);
  return (
    <Layout
      className="flex items-center flex-col"
      title={<span>Scrum Board</span>}
    >
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
      <CustomButton onClick={addScrum}>add scrum</CustomButton>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/scrum/:scrumId" element={<ScrumPage />} />
        <Route path="/scrum-mini/:scrumId" element={<ScrumMiniPage />} />
      </Routes>
    </Router>
  );
}
