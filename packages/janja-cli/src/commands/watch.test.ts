import { Command } from 'commander';
import { describe, expect, it } from 'vitest';
import { watchCommand } from './watch.js';

describe('watchCommand', () => {
  it('should be a valid Command instance', () => {
    expect(watchCommand).toBeInstanceOf(Command);
  });

  it('should have correct name', () => {
    expect(watchCommand.name()).toBe('watch');
  });

  it('should have description', () => {
    expect(watchCommand.description()).toBeTruthy();
  });

  it('should have arguments', () => {
    const args = watchCommand.registeredArguments;

    expect(args.length).toBeGreaterThan(0);
  });

  it('should have recursive option', () => {
    const { options } = watchCommand;
    const recursiveOption = options.find(
      (opt: any) => opt.long === '--recursive',
    );

    expect(recursiveOption).toBeDefined();
  });
});
