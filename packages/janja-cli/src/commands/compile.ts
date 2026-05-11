import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { Command } from 'commander';
import { precompileTemplate } from 'janja';

export const compileCommand = new Command('compile')
  .description('Pre-compile templates to disk')
  .argument('<input>', 'Input template file or directory')
  .argument('[output]', 'Output directory for compiled templates', './compiled')
  .option('-w, --watch', 'Watch for file changes and recompile')
  .option('-r, --recursive', 'Recursively compile templates in directory')
  .option('--runtime', 'Include runtime in output for standalone execution')
  .action(async (input: string, output: string, options: any) => {
    try {
      await compileTemplate(input, output, options);
      console.log(`Templates compiled successfully to ${output}`);
    } catch (error: any) {
      console.error('Compilation failed:', error.message);
      process.exit(1);
    }
  });

export async function compileTemplate(
  input: string,
  output: string,
  options: { watch?: boolean; recursive?: boolean; runtime?: boolean },
) {
  const stats = await import('fs').then((fs) => fs.statSync(input));

  if (stats.isDirectory()) {
    await compileDirectory(input, output, options.recursive, options.runtime);
  } else {
    await compileSingleFile(input, output, options.runtime);
  }
}

async function compileDirectory(
  inputDir: string,
  outputDir: string,
  recursive?: boolean,
  includeRuntime?: boolean,
) {
  const entries = await readdir(inputDir, { withFileTypes: true });

  for (const entry of entries) {
    const inputPath = join(inputDir, entry.name);

    if (entry.isDirectory() && recursive) {
      const outputPath = join(outputDir, entry.name);

      await compileDirectory(inputPath, outputPath, recursive, includeRuntime);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.janja') || entry.name.endsWith('.html'))
    ) {
      await compileSingleFile(inputPath, outputDir, includeRuntime);
    }
  }
}

async function compileSingleFile(
  input: string,
  outputDir: string,
  includeRuntime?: boolean,
) {
  const templateContent = await readFile(input, 'utf-8');

  const compiledCode = await precompileTemplate(templateContent, {
    includeRuntime,
  });

  const inputBasename = basename(input);
  const outputPath = join(
    outputDir,
    inputBasename.replace(/\.(janja|html)$/, '.js'),
  );

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, compiledCode, 'utf-8');
}
