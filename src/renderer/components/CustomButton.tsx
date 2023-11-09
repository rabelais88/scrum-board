import { ButtonHTMLAttributes, PropsWithChildren, forwardRef } from 'react';
import { joinClass } from '../../utils';

interface CustomButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren,
    PropsWithClass {}
const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, children, ...props }: CustomButtonProps, ref) => {
    return (
      <button
        ref={ref}
        className={joinClass(
          'text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default CustomButton;
