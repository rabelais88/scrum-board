import { PropsWithChildren } from 'react';
import { joinClass } from '../../utils';

interface LayoutProps extends PropsWithClass, PropsWithChildren {
  title?: JSX.Element;
}
const Layout = ({ className, children, title }: LayoutProps) => {
  return (
    <div
      data-comp="layout"
      className={joinClass(
        'bg-base-white text-base-black min-h-screen p-5',
        className
      )}
    >
      {title && (
        <h1 aria-roledescription="title area" className="font-bold text-lg">
          {title}
        </h1>
      )}
      {children}
    </div>
  );
};

export default Layout;
