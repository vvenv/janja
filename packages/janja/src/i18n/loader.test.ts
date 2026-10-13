import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { createI18nWithLoader, loadTranslations } from './loader';
import { I18n } from './index';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'janja-i18n-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('loads json translations, one locale per file', async () => {
  await writeFile(
    join(directory, 'en.json'),
    JSON.stringify({ hello: 'Hello', nested: { bye: 'Bye' } }),
  );
  await writeFile(
    join(directory, 'es.json'),
    JSON.stringify({ hello: 'Hola' }),
  );
  await writeFile(join(directory, 'README.md'), 'not a translation');

  const i18n = await createI18nWithLoader({
    defaultLocale: 'en',
    locale: 'es',
    directory,
  });

  expect(i18n.t('hello')).toBe('Hola');

  i18n.setLocale('en');

  expect(i18n.t('hello')).toBe('Hello');
  expect(i18n.t('nested.bye')).toBe('Bye');
});

it('loads simple yaml translations', async () => {
  await writeFile(
    join(directory, 'en.yaml'),
    [
      '# comment',
      'hello: "Hello"',
      'nested:',
      "  bye: 'Bye'",
      '  url: http://example.com',
      'last: Last',
    ].join('\n'),
  );
  await writeFile(join(directory, 'fr.yml'), 'hello: Bonjour');
  await writeFile(join(directory, 'en.json'), '{ "hello": "ignored" }');

  const i18n = new I18n({ defaultLocale: 'en', locale: 'en' });

  await loadTranslations(i18n, { directory, format: 'yaml' });

  expect(i18n.t('hello')).toBe('Hello');
  expect(i18n.t('nested.bye')).toBe('Bye');
  expect(i18n.t('nested.url')).toBe('http://example.com');
  expect(i18n.t('last')).toBe('Last');

  i18n.setLocale('fr');

  expect(i18n.t('hello')).toBe('Bonjour');
});

it('fails loudly instead of silently loading nothing', async () => {
  const i18n = new I18n({ defaultLocale: 'en', locale: 'en' });

  await expect(
    loadTranslations(i18n, { directory: join(directory, 'missing') }),
  ).rejects.toThrow();

  await writeFile(join(directory, 'en.json'), '{ broken');

  await expect(loadTranslations(i18n, { directory })).rejects.toThrow(
    /Failed to load translations from .*en\.json/,
  );
  await expect(
    loadTranslations(i18n, { directory, format: 'toml' as any }),
  ).rejects.toThrow('Unsupported format: toml');
});
