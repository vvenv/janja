import { readFile, stat, writeFile } from 'fs/promises';
import { Command } from 'commander';
import { formatTemplate } from 'janja';
import { findTemplates } from './compile.js';

export interface FormatResult {
  file: string;
  /** Whether formatting changes the file */
  changed: boolean;
  /** Set when the template could not be formatted */
  error?: string;
}

export const formatCommand = new Command('format')
  .description('Normalise the spacing inside template tags')
  .argument('<input>', 'Template file or directory')
  .option('-r, --recursive', 'Also format templates in subdirectories')
  .option('--check', 'Only report files that would change; do not write')
  .action(
    async (
      input: string,
      options: { recursive?: boolean; check?: boolean },
    ) => {
      const results = await formatTemplates(input, options);
      const changed = results.filter((result) => result.changed);
      const failed = results.filter((result) => result.error);

      for (const { file, error } of failed) {
        console.log(`${file}: ${error}`);
      }

      for (const { file } of changed) {
        console.log(options.check ? `${file}: needs formatting` : file);
      }

      console.log(
        `${results.length} template(s) checked, ${changed.length} ${
          options.check ? 'need formatting' : 'formatted'
        }`,
      );

      if (failed.length || (options.check && changed.length)) {
        process.exitCode = 1;
      }
    },
  );

/**
 * Format a template file, or every template in a directory, in place.
 * With `check`, nothing is written.
 */
export async function formatTemplates(
  input: string,
  { recursive, check }: { recursive?: boolean; check?: boolean } = {},
): Promise<FormatResult[]> {
  const files = (await stat(input)).isDirectory()
    ? await findTemplates(input, recursive)
    : [input];

  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, 'utf-8');

      try {
        const formatted = formatTemplate(source);

        if (formatted !== source && !check) {
          await writeFile(file, formatted, 'utf-8');
        }

        return { file, changed: formatted !== source };
      } catch (error: any) {
        return { file, changed: false, error: error.message };
      }
    }),
  );
}
