import chokidar from 'chokidar';
import { Command } from 'commander';
import { type CompileOptions, compileTemplate, isTemplate } from './compile.js';

export const watchCommand = new Command('watch')
  .description('Watch templates for changes and recompile')
  .argument('<input>', 'Input template file or directory')
  .argument('[output]', 'Output directory for compiled templates', './compiled')
  .option('-r, --recursive', 'Recursively watch templates in directory')
  .option('--runtime', 'Also export a ready-to-call render function')
  .option('--source-map', 'Write a source map next to each compiled module')
  .option('--dts', 'Write TypeScript declarations for each compiled module')
  .action(async (input: string, output: string, options: CompileOptions) => {
    // A template may be included by any other one, so everything is
    // recompiled whenever something changes
    const compile = async (reason: string) => {
      try {
        const count = await compileTemplate(input, output, options);

        console.log(`${reason}: compiled ${count} template(s) to ${output}`);
      } catch (error: any) {
        console.error('Compilation failed:', error.details ?? error.message);
      }
    };

    await compile('Initial build');

    const watcher = chokidar.watch(input, {
      persistent: true,
      ignoreInitial: true,
      depth: options.recursive ? undefined : 0,
    });

    for (const event of ['add', 'change', 'unlink'] as const) {
      watcher.on(event, (path: string) => {
        if (isTemplate(path)) {
          void compile(`${event} ${path}`);
        }
      });
    }

    console.log(`Watching ${input} for changes. Press Ctrl+C to stop.`);
  });
