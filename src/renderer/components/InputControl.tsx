import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { joinClass } from '../../utils';
import CustomInput from './CustomInput';

const InputControl = <T extends FieldValues>({
  control,
  rules,
  name,
  className,
  placeholder,
}: UseControllerProps<T> & PropsWithClass & { placeholder?: string }) => {
  const { field } = useController({ control, name, rules });
  return (
    <CustomInput
      {...field}
      className={joinClass('', className)}
      placeholder={placeholder}
    />
  );
};
export default InputControl;
