import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Duration from 'dayjs/plugin/duration';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekday from 'dayjs/plugin/weekday';
import { ENV } from './env';

dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.extend(Duration);
dayjs.extend(customParseFormat);
dayjs.locale('ko');

export const padNum = (num: number | string, padLen: number, fill?: string) => {
  return num.toString().padStart(padLen, fill ?? '0');
};

export const storeDefault: StoreDataMap = {
  settings: { alwaysOnTop: false },
  scrums: [],
  tasks: [],
  taskNowId: -1,
  opacity: ENV === 'development' ? 1 : 0.8,
};

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
  if (secs > 0) txt += `${padNum(secs, 2)}s`;
  if (txt === '') return '00h00m';
  return txt;
};

export const getDayStart = (date: string | Date) => {
  return dayjs(date).startOf('dates').toDate();
};

export const getDayEnd = (date: string | Date) => {
  return dayjs(date).endOf('dates').toDate();
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
  return dayjs(date).startOf('minute').toDate();
};

export const getMonth = (date: dayjs.ConfigType) => {
  return dayjs(date).get('month');
};

export const getDate = (date: dayjs.ConfigType) => {
  return dayjs(date).get('dates');
};

export const getWeek = (date: Date, weekStart: number = 1) => {
  let monthStart = new Date(date);
  monthStart = new Date(monthStart.setDate(0));
  const offset = ((monthStart.getDay() + 1) % 7) - weekStart; // -1 is for a week starting on Monday
  return Math.ceil(( new Date(date).getDate() + offset) / 7);
};

/**
 * @description
 * returns weekday of 1~7
 */
export const getWeekday = (date: dayjs.ConfigType, weekStart: number = 1) => {
  return dayjs(date).locale('ko', { weekStart }).weekday();
};

export const getDaysInMonth = (date: dayjs.ConfigType) => {
  return dayjs(date).daysInMonth();
};

export const setMonth = (date: dayjs.ConfigType, month: number) => {
  return dayjs(date).set('month', month).toDate();
};

export const setDate = (startDate: dayjs.ConfigType, date: number) => {
  return dayjs(startDate).set('dates', date).toDate();
};
