#!/usr/bin/env node
import { createRequire } from 'module';
import { Command } from 'commander';
import { checkCommand } from './commands/check.js';
import { compileCommand } from './commands/compile.js';
import { formatCommand } from './commands/format.js';
import { watchCommand } from './commands/watch.js';

const { version } = createRequire(import.meta.url)('../package.json');

const program = new Command();

program
  .name('janja')
  .description('CLI tool for pre-compiling Janja templates')
  .version(version);

program.addCommand(compileCommand);
program.addCommand(watchCommand);
program.addCommand(checkCommand);
program.addCommand(formatCommand);

program.parse();
