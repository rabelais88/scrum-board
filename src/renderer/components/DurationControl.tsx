import { useEffect, useMemo, useState } from 'react';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import {
  formatDuration,
  joinClass,
  parseDuration,
  validDuration,
} from '../../utils';
import CustomInput from './CustomInput';

const DurationControl = <T extends FieldValues>({
  control,
  rules,
  name,
  className,
}: UseControllerProps<T> & PropsWithClass) => {
  const { field } = useController({ control, name, rules });
  const [strDur, setStrDur] = useState(formatDuration(field.value));
  const valid = useMemo(() => validDuration(strDur), [strDur]);
  useEffect(() => {
    const hasDiff = strDur !== formatDuration(field.value);
    if (valid && hasDiff) {
      field.onChange(parseDuration(strDur));
    }
  }, [strDur, valid]);
  return (
    <CustomInput
      data-valid={valid}
      value={strDur}
      onChange={(ev) => setStrDur(ev.target.value)}
      className={joinClass('data-[valid=false]:text-red-500', className)}
    />
  );
};
export default DurationControl;
