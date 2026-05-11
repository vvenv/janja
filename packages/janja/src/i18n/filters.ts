import type { ObjectType } from '../types';
import { i18n } from './index';

export function i18nTranslate(
  this: ObjectType,
  key: string,
  params: ObjectType = {},
) {
  return i18n.t(key, params);
}

export function i18nPluralize(
  this: ObjectType,
  key: string,
  count: number,
  params: ObjectType = {},
) {
  return i18n.pluralize(key, count, params);
}

export function i18nFormatDate(
  this: ObjectType,
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
) {
  return i18n.formatDate(date, options);
}

export function i18nFormatNumber(
  this: ObjectType,
  number: number,
  options?: Intl.NumberFormatOptions,
) {
  return i18n.formatNumber(number, options);
}

export function i18nFormatCurrency(
  this: ObjectType,
  number: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
) {
  return i18n.formatCurrency(number, currency, options);
}

// Export filters object for easy integration
export const i18nFilters = {
  t: i18nTranslate,
  translate: i18nTranslate,
  pluralize: i18nPluralize,
  formatDate: i18nFormatDate,
  formatNumber: i18nFormatNumber,
  formatCurrency: i18nFormatCurrency,
};
