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
  // Loaded lazily so that the entry point stays importable in browsers
  const { readdir, readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');

  if (format !== 'json' && format !== 'yaml') {
    throw new Error(`Unsupported format: ${format}`);
  }

  const extension = format === 'json' ? /\.json$/ : /\.ya?ml$/;

  // Only files of the requested format are translations; anything else in
  // the directory is left alone
  for (const file of (await readdir(directory)).sort()) {
    if (!extension.test(file)) {
      continue;
    }

    const [locale] = file.split('.');
    const content = await readFile(join(directory, file), 'utf-8');

    try {
      // The YAML parser handles nested key/value maps only; pre-parse the
      // files with a YAML library if they use anything beyond that
      const translations: TranslationDict =
        format === 'json' ? JSON.parse(content) : parseSimpleYaml(content);

      i18n.addTranslations(locale, translations);
    } catch (error: any) {
      throw new Error(
        `Failed to load translations from ${join(directory, file)}: ${error.message}`,
      );
    }
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
