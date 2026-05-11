import { chokidar } from 'chokidar';
import { Command } from 'commander';
import { compileTemplate } from './compile.js';

export const watchCommand = new Command('watch')
  .description('Watch templates for changes and recompile')
  .argument('<input>', 'Input template file or directory')
  .argument('[output]', 'Output directory for compiled templates', './compiled')
  .option('-r, --recursive', 'Recursively watch templates in directory')
  .action(async (input: string, output: string, options: any) => {
    console.log(`Watching ${input} for changes...`);
    console.log(`Output directory: ${output}`);

    const watcher = chokidar.watch(input, {
      persistent: true,
      ignoreInitial: false,
    });

    watcher.on('change', async (path: string) => {
      console.log(`\nFile changed: ${path}`);

      try {
        await compileTemplate(path, output, options);
        console.log('Recompiled successfully');
      } catch (error: any) {
        console.error('Recompilation failed:', error.message);
      }
    });

    watcher.on('add', async (path: string) => {
      console.log(`\nFile added: ${path}`);

      try {
        await compileTemplate(path, output, options);
        console.log('Compiled successfully');
      } catch (error: any) {
        console.error('Compilation failed:', error.message);
      }
    });

    console.log('Press Ctrl+C to stop watching');
  });
