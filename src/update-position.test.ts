import { expect, it } from 'vitest';
import { updatePosition } from './update-position';

it('updates column when there are no newlines', () => {
  expect(updatePosition('hello', { line: 1, column: 1 })).toEqual({
    line: 1,
    column: 6,
  });
});

it('updates line and column when there are newlines', () => {
  expect(updatePosition('foo\nbar\nbaz', { line: 1, column: 1 })).toEqual({
    line: 3,
    column: 4,
  });
});

it('handles string ending with newline', () => {
  expect(updatePosition('abc\n', { line: 2, column: 5 })).toEqual({
    line: 3,
    column: 1,
  });
});

it('handles empty string', () => {
  expect(updatePosition('', { line: 1, column: 1 })).toEqual({
    line: 1,
    column: 1,
  });
});

it('mutates the original position object', () => {
  const pos = { line: 1, column: 1 };

  updatePosition('foo\nbar', pos);
  expect(pos).toEqual({ line: 2, column: 4 });
});
