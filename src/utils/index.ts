import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs'
import Duration from 'dayjs/plugin/duration';

dayjs.extend(Duration);
dayjs.extend(customParseFormat);

export const padNum = (num: number | string, padLen: number, fill?: string) => {
  return num.toString().padStart(padLen, fill ?? '0')
}


export const storeDefault:StoreDataMap = {
  settings: {alwaysOnTop: false},
  scrums: [],
  tasks: [],
  taskNowId: -1
}

export function delimitKo(
  num: string | number | undefined | null,
  fallback?: string
) {
  if (!num && fallback) return fallback;
  return Number(num ?? 0).toLocaleString();
}

type _Class = string | null | undefined;
export const joinClass = (...classNames: _Class[]) => {
  return classNames.filter((c) => !!c).join(' ');
};

export const validDuration = (strDuration: string) => {
  const re = /^([0-9]{1,2}h[0-9]{1,2}m|[0-9]{1,2}m|[0-9]{1,2}h)$/i;
  return re.test(strDuration);
};

const noNan = (num: number) => (Number.isNaN(num) ? 0 : num);

export const parseDuration = (strDuration: string) => {
  const hours = Number(/([0-9]{1,2})h/i.exec(strDuration)?.[1] ?? '0');
  const minutes = Number(/([0-9]{1,2})m/i.exec(strDuration)?.[1] ?? '0');
  return dayjs
    .duration({
      hours: noNan(hours),
      minutes: noNan(minutes),
    })
    .asMilliseconds();
};

export const formatTimeOnly = (date: string | Date) => {
  return dayjs(date).format('HH[h]mm[m]');
};

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD ddd');
};

export const getDiff = (dateA: string | Date, dateB: string | Date) => {
  return dayjs(dateA).diff(dateB);
};

export const formatDuration = (duration: number) => {
  let txt = '';
  if (duration < 0) txt = '-';
  const dur = dayjs.duration(Math.abs(duration));
  let hrs = dur.hours() ?? 0;
  const mins = dur.minutes() ?? 0;
  const secs = dur.seconds() ?? 0;
  if (dur.days() > 0) hrs += dur.days() * 24;
  if (hrs > 0) txt += `${padNum(hrs, 2)}h`;
  if (mins > 0) txt += `${padNum(mins, 2)}m`;
  if (secs > 0) txt += `${padNum(secs,2)}s`;
  if (txt === '') return '00h00m';
  return txt;
};

export const getDayStart = (date: string | Date) => {
  return dayjs(date)    .set('hours', 0)
  .set('minutes', 0)
  .set('seconds', 0)
    .toDate();
};

export const getDayEnd = (date: string | Date) => {
  return dayjs(date).set('hours', 23).set('minutes', 59).set('seconds', 0)
    .toDate();
};

export const formatTimeFromDate = (
  startDate: string | Date,
  date: string | Date
) => {
  const diff = getDiff(date, getDayStart(startDate));
  return formatDuration(diff);
};


export const addDiff = (date: string | Date, milliseconds: number) => {
  return dayjs(date).add(milliseconds).toDate();
};

export const cutSeconds = (date: string | Date) => {
  return dayjs(date).set('seconds', 0).toDate()
}

