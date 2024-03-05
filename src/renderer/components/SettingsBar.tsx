import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../utils/store';
import { joinClass } from '../../utils';

const SettingsBar = () => {
  const { store, setStore, setAlwaysOnTop } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const minimized = useMemo(
    () => /\/scrum-mini\/[A-z0-9]+/.test(location.pathname),
    [location.pathname]
  );
  const params = useParams();
  const isScrum = useMemo(
    () => /^\/scrum.+/.test(location.pathname),
    [location]
  );
  const scrumId = Number(params.scrumId ?? '0');
  return (
    <div
      className="flex items-center gap-2 data-[minimized=true]:mb-2"
      data-minimized={minimized}
    >
      <label>
        <input
          type="checkbox"
          // @ts-ignore
          checked={store.settings?.alwaysOnTop ?? false}
          onChange={(ev) => setAlwaysOnTop(ev.target.checked)}
          className="sr-only peer"
        />
        <span
          className={joinClass(
            'peer-checked:text-blue-600 border border-gray-300 w-8 h-8 rounded shadow inline-block',
            'inline-flex justify-center items-center'
          )}
        >
          A
        </span>
      </label>
      {isScrum && (
        <>
          <label>
            <input
              type="checkbox"
              // @ts-ignore
              checked={minimized}
              onChange={(ev) => {
                if (ev.target.checked) {
                  navigate(`/scrum-mini/${scrumId}`);
                  return;
                }
                navigate(`/scrum/${scrumId}`);
              }}
              className="sr-only peer"
            />
            <span
              className={joinClass(
                'peer-checked:text-blue-600 border border-gray-300 w-8 h-8 rounded shadow inline-block',
                'inline-flex justify-center items-center'
              )}
            >
              M
            </span>
          </label>
          <input
            id="opacity-range"
            type="range"
            value={store.opacity ?? 0.3}
            min={0.3}
            max={1}
            step={0.1}
            onChange={(ev) =>
              setStore({ ...store, opacity: Number(ev.target.value) })
            }
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </>
      )}
    </div>
  );
};

export default SettingsBar;
