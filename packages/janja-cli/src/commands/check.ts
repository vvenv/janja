import { readFile, stat } from 'fs/promises';
import { dirname } from 'path';
import { Command } from 'commander';
import { validateTemplate, type ValidationError } from 'janja';
import { createLoader, findTemplates } from './compile.js';

export interface CheckResult {
  file: string;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const checkCommand = new Command('check')
  .description('Validate templates without compiling them')
  .argument('<input>', 'Template file or directory')
  .option('-r, --recursive', 'Also check templates in subdirectories')
  .option('--strict', 'Treat warnings, such as unknown filters, as errors')
  .action(
    async (
      input: string,
      options: { recursive?: boolean; strict?: boolean },
    ) => {
      const results = await checkTemplates(input, options);

      let problems = 0;

      for (const { file, errors, warnings } of results) {
        for (const { type, message, line, column } of [
          ...errors,
          ...warnings,
        ]) {
          console.log(
            `${file}:${line ?? 1}:${column ?? 1} ${type}: ${message}`,
          );
        }

        problems += errors.length + (options.strict ? warnings.length : 0);
      }

      console.log(
        `Checked ${results.length} template(s), ${problems} problem(s) found`,
      );

      if (problems) {
        process.exitCode = 1;
      }
    },
  );

/**
 * Validate a template file, or every template in a directory.
 */
export async function checkTemplates(
  input: string,
  { recursive }: { recursive?: boolean } = {},
): Promise<CheckResult[]> {
  const isDirectory = (await stat(input)).isDirectory();
  const files = isDirectory ? await findTemplates(input, recursive) : [input];
  const loader = createLoader(isDirectory ? input : dirname(input));

  return Promise.all(
    files.map(async (file) => {
      const { errors, warnings } = await validateTemplate(
        await readFile(file, 'utf-8'),
        { loader },
      );

      return { file, errors, warnings };
    }),
  );
}
