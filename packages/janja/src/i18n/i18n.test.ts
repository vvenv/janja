import { beforeEach, describe, expect, it } from 'vitest';
import { I18n } from './index';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    i18n = new I18n({
      defaultLocale: 'en',
      locale: 'en',
      translations: {
        en: {
          hello: 'Hello',
          welcome: 'Welcome, {{name}}!',
          messages: {
            inbox: 'Inbox',
            sent: 'Sent',
          },
          items: {
            one: '1 item',
            other: '{{count}} items',
          },
        },
        es: {
          hello: 'Hola',
          welcome: '¡Bienvenido, {{name}}!',
          messages: {
            inbox: 'Bandeja de entrada',
            sent: 'Enviado',
          },
          items: {
            one: '1 elemento',
            other: '{{count}} elementos',
          },
        },
      },
    });
  });

  it('should translate simple keys', () => {
    expect(i18n.t('hello')).toBe('Hello');
  });

  it('should interpolate parameters', () => {
    expect(i18n.t('welcome', { name: 'John' })).toBe('Welcome, John!');
  });

  it('should translate nested keys', () => {
    expect(i18n.t('messages.inbox')).toBe('Inbox');
  });

  it('should return key if translation not found', () => {
    expect(i18n.t('nonexistent')).toBe('nonexistent');
  });

  it('should change locale', () => {
    i18n.setLocale('es');
    expect(i18n.t('hello')).toBe('Hola');
  });

  it('should get current locale', () => {
    expect(i18n.getLocale()).toBe('en');
    i18n.setLocale('es');
    expect(i18n.getLocale()).toBe('es');
  });

  it('should add translations', () => {
    i18n.addTranslations('fr', {
      hello: 'Bonjour',
    });
    i18n.setLocale('fr');
    expect(i18n.t('hello')).toBe('Bonjour');
  });

  it('should merge translations when adding', () => {
    i18n.addTranslations('en', {
      goodbye: 'Goodbye',
    });
    expect(i18n.t('hello')).toBe('Hello');
    expect(i18n.t('goodbye')).toBe('Goodbye');
  });

  it('should pluralize correctly', () => {
    expect(i18n.pluralize('items', 1)).toBe('1 item');
    expect(i18n.pluralize('items', 5)).toBe('5 items');
  });

  it('should pluralize with parameters', () => {
    expect(i18n.pluralize('items', 5, { count: 5 })).toBe('5 items');
  });

  it('should format dates', () => {
    const date = new Date('2024-01-15');

    expect(i18n.formatDate(date)).toContain('2024');
  });

  it('should format numbers', () => {
    expect(i18n.formatNumber(1234.56)).toBe('1,234.56');
  });

  it('should format currency', () => {
    expect(i18n.formatCurrency(1234.56, 'USD')).toContain('$');
  });

  it('should fallback to default locale if translation not found in current locale', () => {
    i18n.setLocale('es');
    expect(i18n.t('hello')).toBe('Hola');
    // This key doesn't exist in es, should fallback to en
    expect(i18n.t('nonexistent')).toBe('nonexistent');
  });
});

describe('I18n Plural Rules', () => {
  it('should handle English pluralization', () => {
    const i18n = new I18n({ locale: 'en' });

    expect(i18n['getPluralForm'](1)).toBe('one');
    expect(i18n['getPluralForm'](2)).toBe('other');
    expect(i18n['getPluralForm'](0)).toBe('other');
  });

  it('should handle Spanish pluralization', () => {
    const i18n = new I18n({ locale: 'es' });

    expect(i18n['getPluralForm'](1)).toBe('one');
    expect(i18n['getPluralForm'](2)).toBe('other');
  });

  it('should handle French pluralization', () => {
    const i18n = new I18n({ locale: 'fr' });

    expect(i18n['getPluralForm'](0)).toBe('one');
    expect(i18n['getPluralForm'](1)).toBe('one');
    expect(i18n['getPluralForm'](2)).toBe('other');
  });

  it('should handle Japanese pluralization (no plural)', () => {
    const i18n = new I18n({ locale: 'ja' });

    expect(i18n['getPluralForm'](1)).toBe('other');
    expect(i18n['getPluralForm'](2)).toBe('other');
  });

  it('should handle Chinese pluralization (no plural)', () => {
    const i18n = new I18n({ locale: 'zh' });

    expect(i18n['getPluralForm'](1)).toBe('other');
    expect(i18n['getPluralForm'](2)).toBe('other');
  });

  it('should handle Russian pluralization', () => {
    const i18n = new I18n({ locale: 'ru' });

    expect(i18n['getPluralForm'](1)).toBe('one');
    expect(i18n['getPluralForm'](2)).toBe('few');
    expect(i18n['getPluralForm'](5)).toBe('many');
    expect(i18n['getPluralForm'](21)).toBe('one');
  });

  it('should handle Arabic pluralization', () => {
    const i18n = new I18n({ locale: 'ar' });

    expect(i18n['getPluralForm'](0)).toBe('zero');
    expect(i18n['getPluralForm'](1)).toBe('one');
    expect(i18n['getPluralForm'](2)).toBe('two');
    expect(i18n['getPluralForm'](5)).toBe('few');
    expect(i18n['getPluralForm'](15)).toBe('many');
  });
});
