import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppStore, useSettingsOpen } from '../utils/store';
import CustomButton from './CustomButton';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isScrum = useMemo(
    () => /^\/scrum.+/.test(location.pathname),
    [location]
  );
  const scrumId = Number(params.scrumId ?? '0');
  const { store, setStore, setAlwaysOnTop } = useAppStore();
  const { setSettingsOpen } = useSettingsOpen();
  console.log('pathname', location.pathname);
  const minimized = useMemo(
    () => /\/scrum-mini\/[A-z0-9]+/.test(location.pathname),
    [location.pathname]
  );
  return (
    <div className="relative overflow-x-auto rounded-xl">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <tbody>
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4" colSpan={2}>
              <CustomButton onClick={() => setSettingsOpen(false)}>
                close
              </CustomButton>
            </td>
          </tr>
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              always on top
            </th>
            <td className="px-6 py-4">
              <input
                type="checkbox"
                // @ts-ignore
                checked={store.settings?.alwaysOnTop ?? false}
                onChange={(ev) => setAlwaysOnTop(ev.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </td>
          </tr>
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              opacity
            </th>
            <td className="px-6 py-4">
              {/* <label for="default-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Default range</label> */}
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </td>
          </tr>
          {isScrum && (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                minimize
              </th>
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  // @ts-ignore
                  checked={minimized}
                  onChange={(ev) => {
                    if (ev.target.checked) {
                      navigate(`/scrum-mini/${scrumId}`);
                      setSettingsOpen(false);
                      return;
                    }
                    navigate(`/scrum/${scrumId}`);
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
