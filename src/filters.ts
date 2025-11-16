import type { ObjectType } from './types'
import { Safe } from './safe'

export * from './escape'

export function abs(this: ObjectType, value = 0) {
  return Math.abs(value)
}
export function add(this: ObjectType, value = 0, addend = 0) {
  return value + addend
}
export function capitalize(this: ObjectType, value = '') {
  return value.replace(/\b\w/g, match => match.toUpperCase())
}
export function ceil(this: ObjectType, value = 0) {
  return Math.ceil(value)
}
export function compact(this: ObjectType, value: any[] = []) {
  return value.filter(v => v != null)
}
export function div(this: ObjectType, value = 0, divisor = 1) {
  return value / divisor
}
export function entries(this: ObjectType, value: ObjectType = {}) {
  return Object.entries(value)
}
export function even(this: ObjectType, value: number | string = 0) {
  return +value % 2 === 0
}
export function fallback(this: ObjectType, value: any, defaultValue: any, anyFalsy = false) {
  return anyFalsy ? (value || defaultValue) : (value ?? defaultValue)
}
export function first(this: ObjectType, value: string | any[] = []) {
  return [...value][0]
}
export function get(this: ObjectType, value: ObjectType, ...path: string[]) {
  return path.reduce((acc, cur) => (acc && typeof acc === 'object' && (cur in acc)) ? acc[cur] : undefined, value)
}
export function groupby(this: ObjectType, value: ObjectType[] = [], key: string) {
  return value.reduce(
    (o, v) => {
      const k = v[key]

      return {
        ...o,
        [k]: [...(o[k] || []), v],
      }
    },
    {} as Record<string, ObjectType[]>,
  )
}
export function join(
  this: ObjectType,
  value: string | string[] = [],
  separator = '',
) {
  return [...value].join(separator)
}
export function json(this: ObjectType, value: any = null, indent = 0) {
  return new Safe(JSON.stringify(value, null, indent))
}
export function keys(this: ObjectType, value: ObjectType = {}) {
  return Object.keys(value)
}
export function last(this: ObjectType, value: string | any[] = []) {
  return [...value].reverse()[0]
}
export function length(this: ObjectType, value = '') {
  return value.length
}
export function lower(this: ObjectType, value = '') {
  return value.toLowerCase()
}
export function map(
  this: ObjectType,
  value: ObjectType[] = [],
  key: string,
  defaultValue?: any,
) {
  return value.map(o => o[key] ?? defaultValue)
}
export function max(this: ObjectType, value = 0, ...values: number[]) {
  return Math.max(value, ...values)
}
export function min(this: ObjectType, value = 0, ...values: number[]) {
  return Math.min(value, ...values)
}
export function mul(this: ObjectType, value = 0, multiplier = 1) {
  return value * multiplier
}
export function odd(this: ObjectType, value: number | string = 0) {
  return +value % 2 === 1
}
export function omit(this: ObjectType, value: ObjectType = {}, ...keys: string[]) {
  return Object.entries(value).reduce(
    (o, [k, v]) => (keys.includes(k) ? o : { ...o, [k]: v }),
    {},
  )
}
export function pick(this: ObjectType, value: ObjectType = {}, ...keys: string[]) {
  return keys.reduce((o, k) => ({ ...o, [k]: value[k] }), {})
}
export function repeat(this: ObjectType, value = '', count = 0) {
  return value.repeat(count)
}
export function replace(
  this: ObjectType,
  value = '',
  search: string,
  replace: string,
) {
  return value.replace(new RegExp(search, 'g'), replace)
}
export function reverse(this: ObjectType, value: string | any[] = []) {
  return Array.isArray(value) ? value.reverse() : [...value].reverse().join('')
}
export function safe(this: ObjectType, value = '') {
  return new Safe(value)
}
export function slice(this: ObjectType, value = '', start = 0, end?: number) {
  return value.slice(start, end)
}
export function sort(this: ObjectType, value: string | any[] = []) {
  return Array.isArray(value) ? value.sort() : [...value].sort().join('')
}
export function split(this: ObjectType, value = '', separator = '') {
  return value.split(separator)
}
export function sub(this: ObjectType, value = 0, subtrahend = 0) {
  return value - subtrahend
}
export function sum(this: ObjectType, value: number[] = []) {
  return value.reduce((a, b) => a + b, 0)
}
export function trim(this: ObjectType, value = '') {
  return value.trim()
}
export function truncate(this: ObjectType, value = '', length = 0, truncateStr = '...') {
  return value.slice(0, length) + (value.length > length ? truncateStr : '')
}
export function unique(this: ObjectType, value: string | any[] = '') {
  return Array.isArray(value)
    ? Array.from(new Set(value))
    : Array.from(new Set(value)).join('')
}
export function upper(this: ObjectType, value = '') {
  return value.toUpperCase()
}
export function urldecode(this: ObjectType, value = '') {
  return decodeURIComponent(value)
}
export function urlencode(this: ObjectType, value = '') {
  return encodeURIComponent(value)
}
export function values(this: ObjectType, value: ObjectType = {}) {
  return Object.values(value)
}
