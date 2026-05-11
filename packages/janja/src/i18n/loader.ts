import { readFile } from 'fs/promises';
import { I18n, type I18nOptions, type TranslationDict } from './index';

export interface TranslationLoaderOptions {
  directory: string;
  format?: 'json' | 'yaml';
}

export async function loadTranslations(
  i18n: I18n,
  options: TranslationLoaderOptions,
): Promise<void> {
  const { directory, format = 'json' } = options;
  const { readdir } = await import('fs/promises');
  const { join } = await import('path');

  try {
    const files = await readdir(directory);

    for (const file of files) {
      const [locale] = file.split('.');
      const filePath = join(directory, file);
      const content = await readFile(filePath, 'utf-8');

      let translations: TranslationDict;

      if (format === 'json') {
        translations = JSON.parse(content);
      } else if (format === 'yaml') {
        // Simple YAML parser for basic cases
        // For production, use a proper YAML library like js-yaml
        translations = parseSimpleYaml(content);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      i18n.addTranslations(locale, translations);
    }
  } catch (error) {
    console.error(`Failed to load translations from ${directory}:`, error);
  }
}

function parseSimpleYaml(yaml: string): TranslationDict {
  const result: TranslationDict = {};
  const lines = yaml.split('\n');

  let currentPath: string[] = [];
  let currentIndent = 0;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const indent = line.search(/\S|$/);
    const trimmed = line.trim();

    if (indent < currentIndent) {
      currentPath = currentPath.slice(0, indent / 2);
    }

    const [key, ...valueParts] = trimmed.split(':');
    const value = valueParts.join(':').trim();

    if (value) {
      const obj = currentPath.reduce(
        (acc: TranslationDict, k): TranslationDict => acc[k] as TranslationDict,
        result,
      );

      obj[key] = value.replace(/^['"]|['"]$/g, '');
    } else {
      currentPath.push(key);

      const obj = currentPath
        .slice(0, -1)
        .reduce(
          (acc: TranslationDict, k): TranslationDict =>
            acc[k] as TranslationDict,
          result,
        );

      obj[key] = {};
    }

    currentIndent = indent;
  }

  return result;
}

export async function createI18nWithLoader(
  options: I18nOptions & TranslationLoaderOptions,
): Promise<I18n> {
  const i18n = new I18n(options);

  if (options.directory) {
    await loadTranslations(i18n, {
      directory: options.directory,
      format: options.format,
    });
  }

  return i18n;
}
