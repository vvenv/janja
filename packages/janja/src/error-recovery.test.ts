import { expect, it, vi } from 'vitest';
import {
  createErrorRecovery,
  defaultErrorHandler,
  ErrorRecovery,
} from './error-recovery';

it('creates error recovery with defaults', () => {
  const recovery = createErrorRecovery();

  expect(recovery).toBeInstanceOf(ErrorRecovery);
});

it('uses undefined fallback for missing values', () => {
  const recovery = createErrorRecovery({ undefinedFallback: 'N/A' });
  const accessor = recovery.createSafeAccessor({ name: 'John' });

  expect(accessor('name')).toBe('John');
  expect(accessor('age')).toBe('N/A');
});

it('ignores missing filters when configured', () => {
  const recovery = createErrorRecovery({ ignoreMissingFilters: true });
  const result = recovery.safeApplyFilter('test', 'unknownFilter', undefined);

  expect(result).toBe('test');
});

it('continues on error when configured', () => {
  const recovery = createErrorRecovery({
    continueOnError: true,
    onError: () => 'fallback',
    undefinedFallback: 'fallback',
  });
  const accessor = recovery.createSafeAccessor({});

  expect(accessor('deep.nested.path')).toBe('fallback');
});

it('default error handler logs to console', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  defaultErrorHandler(new Error('test error'), {
    template: 'test',
    data: {},
    expression: 'test',
  });

  expect(consoleSpy).toHaveBeenCalled();

  consoleSpy.mockRestore();
});
