import type { ObjectType } from '../types';

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface I18nOptions {
  defaultLocale?: string;
  locale?: string;
  translations?: Record<string, TranslationDict>;
  pluralRules?: PluralRules;
}

export interface PluralRules {
  [locale: string]: (
    n: number,
  ) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
}

export class I18n {
  private defaultLocale: string;

  private currentLocale: string;

  private translations: Record<string, TranslationDict>;

  private pluralRules: PluralRules;

  constructor(options: I18nOptions = {}) {
    this.defaultLocale = options.defaultLocale || 'en';
    this.currentLocale = options.locale || this.defaultLocale;
    this.translations = options.translations || {};
    this.pluralRules = options.pluralRules || this.getDefaultPluralRules();
  }

  setLocale(locale: string) {
    this.currentLocale = locale;
  }

  getLocale(): string {
    return this.currentLocale;
  }

  addTranslations(locale: string, translations: TranslationDict) {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }

    this.translations[locale] = this.mergeDeep(
      this.translations[locale],
      translations,
    );
  }

  translate(key: string, params: ObjectType = {}): string {
    const translation = this.getTranslation(key);

    if (!translation) {
      return key;
    }

    return this.interpolate(translation, params);
  }

  t(key: string, params: ObjectType = {}): string {
    return this.translate(key, params);
  }

  pluralize(key: string, count: number, params: ObjectType = {}): string {
    const pluralForm = this.getPluralForm(count);
    const pluralKey = `${key}.${pluralForm}`;
    const translation = this.getTranslation(pluralKey);

    if (translation) {
      return this.interpolate(translation, { ...params, count });
    }

    // Fallback to singular form if plural not found
    const singularTranslation = this.getTranslation(key);

    if (singularTranslation) {
      return this.interpolate(singularTranslation, { ...params, count });
    }

    return key;
  }

  formatDate(
    date: Date | string,
    options?: Intl.DateTimeFormatOptions,
  ): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(this.currentLocale, options).format(d);
  }

  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  formatCurrency(
    number: number,
    currency: string,
    options?: Intl.NumberFormatOptions,
  ): string {
    return new Intl.NumberFormat(this.currentLocale, {
      ...options,
      style: 'currency',
      currency,
    }).format(number);
  }

  private getTranslation(key: string): string | null {
    const keys = key.split('.');

    let value: any = this.translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  private interpolate(template: string, params: ObjectType): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : key;
    });
  }

  private getPluralForm(count: number): string {
    const pluralRule = this.pluralRules[this.currentLocale];

    if (pluralRule) {
      return pluralRule(count);
    }

    return this.pluralRules[this.defaultLocale](count);
  }

  private getDefaultPluralRules(): PluralRules {
    return {
      en: (n) => (n === 1 ? 'one' : 'other'),
      es: (n) => (n === 1 ? 'one' : 'other'),
      fr: (n) => (n === 0 || n === 1 ? 'one' : 'other'),
      de: (n) => (n === 1 ? 'one' : 'other'),
      ru: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;

        if (mod10 === 1 && mod100 !== 11) {
          return 'one';
        }

        if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
          return 'few';
        }

        if (mod10 === 0 || (mod10 >= 5 && mod10 <= 9)) {
          return 'many';
        }

        return 'other';
      },
      ja: () => 'other',
      zh: () => 'other',
      ar: (n) => {
        if (n === 0) {
          return 'zero';
        }

        if (n === 1) {
          return 'one';
        }

        if (n === 2) {
          return 'two';
        }

        if (n % 100 >= 3 && n % 100 <= 10) {
          return 'few';
        }

        if (n % 100 >= 11 && n % 100 <= 99) {
          return 'many';
        }

        return 'other';
      },
    };
  }

  private mergeDeep(target: any, source: any): any {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

export const i18n = new I18n();
