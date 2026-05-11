import { Safe } from './safe';
import type { ObjectType } from './types';

export * from './escape';

export function abs(this: ObjectType, value = 0) {
  return Math.abs(value);
}
export function add(this: ObjectType, value = 0, addend = 0) {
  return value + addend;
}
export function capitalize(this: ObjectType, value = '') {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}
export function ceil(this: ObjectType, value = 0) {
  return Math.ceil(value);
}
export function compact(this: ObjectType, value: unknown[] = []) {
  return value.filter((v) => v != null);
}
export function div(this: ObjectType, value = 0, divisor = 1) {
  return value / divisor;
}
export function entries(this: ObjectType, value: ObjectType = {}) {
  return Object.entries(value);
}
export function even(this: ObjectType, value: number | string = 0) {
  return +value % 2 === 0;
}
export function fallback(
  this: ObjectType,
  value: any,
  defaultValue: any,
  anyFalsy = false,
) {
  return anyFalsy ? value || defaultValue : (value ?? defaultValue);
}
export function first(this: ObjectType, value: string | any[] = []) {
  return [...value][0];
}
export function get(this: ObjectType, value: ObjectType, ...path: string[]) {
  return path.reduce(
    (acc, cur) =>
      acc && typeof acc === 'object' && cur in acc ? acc[cur] : undefined,
    value,
  );
}
export function groupby(
  this: ObjectType,
  value: ObjectType[] = [],
  key: string,
) {
  return value.reduce(
    (o: Record<string, ObjectType[]>, v) => {
      const k = v[key] as string;

      return {
        ...o,
        [k]: [...(o[k] || []), v],
      };
    },
    {} as Record<string, ObjectType[]>,
  );
}
export function join(
  this: ObjectType,
  value: string | string[] = [],
  separator = '',
) {
  return [...value].join(separator);
}
export function json(this: ObjectType, value: unknown = null, indent = 0) {
  return new Safe(JSON.stringify(value, null, indent));
}
export function keys(this: ObjectType, value: ObjectType = {}) {
  return Object.keys(value);
}
export function last(this: ObjectType, value: string | unknown[] = []) {
  return [...value].reverse()[0];
}
export function length(this: ObjectType, value = '') {
  return value.length;
}
export function lower(this: ObjectType, value = '') {
  return value.toLowerCase();
}
export function map(
  this: ObjectType,
  value: ObjectType[] = [],
  key: string,
  defaultValue?: unknown,
) {
  return value.map((o) => o[key] ?? defaultValue);
}
export function max(this: ObjectType, value = 0, ...rest: number[]) {
  return Math.max(value, ...rest);
}
export function min(this: ObjectType, value = 0, ...rest: number[]) {
  return Math.min(value, ...rest);
}
export function mul(this: ObjectType, value = 0, multiplier = 1) {
  return value * multiplier;
}
export function odd(this: ObjectType, value: number | string = 0) {
  return +value % 2 === 1;
}
export function omit(
  this: ObjectType,
  value: ObjectType = {},
  ...omitKeys: string[]
) {
  return Object.entries(value).reduce(
    (o, [k, v]) => (omitKeys.includes(k) ? o : { ...o, [k]: v }),
    {},
  );
}
export function pick(
  this: ObjectType,
  value: ObjectType = {},
  ...pickKeys: string[]
) {
  return pickKeys.reduce((o, k) => ({ ...o, [k]: value[k] }), {});
}
export function repeat(this: ObjectType, value = '', count = 0) {
  return value.repeat(count);
}
export function replace(
  this: ObjectType,
  value = '',
  search: string,
  replacement: string,
) {
  return value.replace(new RegExp(search, 'g'), replacement);
}
export function reverse(this: ObjectType, value: string | unknown[] = []) {
  return Array.isArray(value) ? value.reverse() : [...value].reverse().join('');
}
export function safe(this: ObjectType, value = '') {
  return new Safe(value);
}
export function slice(this: ObjectType, value = '', start = 0, end?: number) {
  return value.slice(start, end);
}
export function sort(this: ObjectType, value: string | unknown[] = []) {
  return Array.isArray(value) ? value.sort() : [...value].sort().join('');
}
export function split(this: ObjectType, value = '', separator = '') {
  return value.split(separator);
}
export function sub(this: ObjectType, value = 0, subtrahend = 0) {
  return value - subtrahend;
}
export function sum(this: ObjectType, value: number[] = []) {
  return value.reduce((a, b) => a + b, 0);
}
export function trim(this: ObjectType, value = '') {
  return value.trim();
}
export function truncate(
  this: ObjectType,
  value = '',
  maxLength = 0,
  truncateStr = '...',
) {
  return (
    value.slice(0, maxLength) + (value.length > maxLength ? truncateStr : '')
  );
}
export function unique(this: ObjectType, value: string | unknown[] = '') {
  return Array.isArray(value)
    ? Array.from(new Set(value))
    : Array.from(new Set(value)).join('');
}
export function upper(this: ObjectType, value = '') {
  return value.toUpperCase();
}
export function urldecode(this: ObjectType, value = '') {
  return decodeURIComponent(value);
}
export function urlencode(this: ObjectType, value = '') {
  return encodeURIComponent(value);
}
export function values(this: ObjectType, value: ObjectType = {}) {
  return Object.values(value);
}

// Date/DateTime filters
export function date(this: ObjectType, value: Date | string, format = 'ISO') {
  const dateObj = value instanceof Date ? value : new Date(value);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  switch (format) {
    case 'ISO':
      return dateObj.toISOString();
    case 'date':
      return dateObj.toISOString().split('T')[0];
    case 'time':
      return dateObj.toTimeString().split(' ')[0];
    case 'locale':
      return dateObj.toLocaleDateString();
    case 'locale-time':
      return dateObj.toLocaleTimeString();
    case 'locale-datetime':
      return dateObj.toLocaleString();
    default:
      return dateObj.toISOString();
  }
}

export function timeAgo(this: ObjectType, value: Date | string) {
  const dateObj = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

// Number formatting filters
export function round(this: ObjectType, value: number, decimals = 0) {
  return Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);
}

export function fixed(this: ObjectType, value: number, decimals = 2) {
  return Number(value).toFixed(decimals);
}

export function percent(this: ObjectType, value: number, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function currency(
  this: ObjectType,
  value: number,
  currencyCode = 'USD',
  locale = 'en-US',
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

// Text processing filters
export function wordCount(this: ObjectType, value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function stripTags(this: ObjectType, value: string) {
  return value.replace(/<[^>]*>/g, '');
}

export function slugify(this: ObjectType, value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Array manipulation filters
export function shuffle(this: ObjectType, value: unknown[]) {
  const arr = [...value];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function chunk(this: ObjectType, value: unknown[], size: number) {
  const chunks: unknown[][] = [];

  for (let i = 0; i < value.length; i += size) {
    chunks.push(value.slice(i, i + size));
  }

  return chunks;
}

export function pluck(this: ObjectType, value: ObjectType[], key: string) {
  return value.map((item) => item[key]);
}

// Object transformation filters
export function defaults(
  this: ObjectType,
  value: ObjectType,
  defaultValues: ObjectType,
) {
  return { ...defaultValues, ...value };
}

export function invert(this: ObjectType, value: ObjectType) {
  return Object.entries(value).reduce(
    (acc, [key, val]) => ({ ...acc, [String(val)]: key }),
    {},
  );
}

export function merge(
  this: ObjectType,
  value: ObjectType,
  ...objects: ObjectType[]
) {
  return Object.assign({}, value, ...objects);
}

export async function fetchUrl(
  this: ObjectType,
  url: string,
  options: RequestInit = {},
) {
  const response = await fetch(url, options);

  return response.text();
}

export async function delay(this: ObjectType, value: unknown, ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));

  return value;
}
