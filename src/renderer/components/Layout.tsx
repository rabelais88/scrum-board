import { PropsWithChildren, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { joinClass } from '../../utils';
import { ENV } from '../../utils/env';
import { useAppStore } from '../utils/store';
import SettingsBar from './SettingsBar';

interface LayoutProps extends PropsWithClass, PropsWithChildren {
  title?: JSX.Element;
}
const Layout = ({ className, children, title }: LayoutProps) => {
  const { store } = useAppStore();
  const location = useLocation();
  const minimized = useMemo(
    () => /\/scrum-mini\/[A-z0-9]+/.test(location.pathname),
    [location.pathname]
  );
  return (
    <div
      data-comp="layout"
      className={joinClass(
        'relative bg-base-white dark:bg-base-black text-base-black dark:text-base-white min-h-screen p-5 pt-10',
        className
      )}
      style={{
        opacity: ENV === 'development' || !minimized ? 1 : store.opacity,
      }}
    >
      <div className="flex items-center w-full flex-wrap gap-2">
        <div className="flex-1">
          {title && (
            <h1
              aria-roledescription="title area"
              className="font-bold text-lg flex items-center"
              data-window-drag
            >
              {title}
            </h1>
          )}
        </div>
        <SettingsBar />
      </div>
      {children}
    </div>
  );
};

export default Layout;
