#!/usr/bin/env node
import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';
import { watchCommand } from './commands/watch.js';

const program = new Command();

program
  .name('janja')
  .description('CLI tool for pre-compiling Janja templates')
  .version('1.0.0');

program.addCommand(compileCommand);
program.addCommand(watchCommand);

program.parse();
