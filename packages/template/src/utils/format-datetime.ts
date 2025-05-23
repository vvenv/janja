import { translate } from './translate'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const shortMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const o: Record<string, (d: Date, len: number, translations: Record<string, string>) => string> = {
  y: d => `${d.getUTCFullYear()}`,
  M: (d, len) => `${d.getUTCMonth() + 1}`.padStart(len, '0'),
  N: (d, len, translations) =>
    translate(
      translations,
      (len > 1 ? monthNames : shortMonthNames)[d.getUTCMonth()],
    ),
  d: (d, len) => `${d.getUTCDate()}`.padStart(len, '0'),
  h: (d, len) => `${d.getUTCHours()}`.padStart(len, '0'),
  m: (d, len) => `${d.getUTCMinutes()}`.padStart(len, '0'),
  s: (d, len) => `${d.getUTCSeconds()}`.padStart(len, '0'),
  D: (d, len, translations) =>
    translate(
      translations,
      (len > 1 ? dayNames : shortDayNames)[d.getUTCDay()],
    ),
}

export function formatDatetime(translations: Record<string, string> = {}, value: string | number = 0, format: string) {
  const d = new Date(value)

  return format.replace(/y+|M+|N+|d+|h+|m+|s+|D+/g, (str) => {
    return o[str[0]](d, str.length, translations)
  })
}
