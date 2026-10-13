import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'path';
import { Command } from 'commander';
import { precompile } from 'janja';

export interface CompileOptions {
  recursive?: boolean;
  runtime?: boolean;
  sourceMap?: boolean;
  dts?: boolean;
}

const templateExtension = /\.(janja|html)$/;

export const isTemplate = (path: string) => templateExtension.test(path);

export const compileCommand = new Command('compile')
  .description('Pre-compile templates to disk')
  .argument('<input>', 'Input template file or directory')
  .argument('[output]', 'Output directory for compiled templates', './compiled')
  .option('-r, --recursive', 'Recursively compile templates in directory')
  .option('--runtime', 'Also export a ready-to-call render function')
  .option('--source-map', 'Write a source map next to each compiled module')
  .option('--dts', 'Write TypeScript declarations for each compiled module')
  .action(async (input: string, output: string, options: CompileOptions) => {
    try {
      const count = await compileTemplate(input, output, options);

      console.log(`Compiled ${count} template(s) to ${output}`);
    } catch (error: any) {
      console.error('Compilation failed:', error.details ?? error.message);
      process.exitCode = 1;
    }
  });

/**
 * Compile a template file, or every template in a directory, into ES modules.
 * Returns the number of templates compiled.
 */
export async function compileTemplate(
  input: string,
  output: string,
  options: CompileOptions = {},
) {
  if (!(await stat(input)).isDirectory()) {
    await compileFile(input, dirname(input), output, options);

    return 1;
  }

  const files = await findTemplates(input, options.recursive);

  for (const file of files) {
    await compileFile(file, input, output, options);
  }

  return files.length;
}

export async function findTemplates(dir: string, recursive?: boolean) {
  const files: string[] = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (recursive) {
        files.push(...(await findTemplates(path, recursive)));
      }
    } else if (entry.isFile() && isTemplate(entry.name)) {
      files.push(path);
    }
  }

  return files.sort();
}

/**
 * Includes are resolved relative to the root directory, with or without the
 * template extension, and may not point outside of it.
 */
export function createLoader(root: string) {
  const base = resolve(root);

  return async (path: string) => {
    for (const candidate of [path, `${path}.janja`, `${path}.html`]) {
      const file = resolve(base, candidate);

      if (!file.startsWith(base + sep)) {
        break;
      }

      try {
        return await readFile(file, 'utf-8');
      } catch {
        // try the next candidate
      }
    }

    throw new Error(`Template "${path}" not found in ${root}`);
  };
}

async function compileFile(
  file: string,
  root: string,
  outputDir: string,
  { runtime, sourceMap, dts }: CompileOptions,
) {
  const outputPath = join(
    outputDir,
    relative(root, file).replace(templateExtension, '.js'),
  );

  const result = await precompile(await readFile(file, 'utf-8'), {
    includeRuntime: runtime,
    loader: createLoader(root),
    sourceMap,
    dts,
    // Relative to the map, so that tools find the template on disk
    filename: relative(dirname(outputPath), file).split(sep).join('/'),
  });

  await mkdir(dirname(outputPath), { recursive: true });

  if (result.map) {
    const mapName = `${basename(outputPath)}.map`;

    await writeFile(
      `${outputPath}.map`,
      JSON.stringify({ ...result.map, file: basename(outputPath) }),
      'utf-8',
    );
    result.code += `//# sourceMappingURL=${mapName}\n`;
  }

  if (result.dts) {
    await writeFile(outputPath.replace(/\.js$/, '.d.ts'), result.dts, 'utf-8');
  }

  await writeFile(outputPath, result.code, 'utf-8');
}
