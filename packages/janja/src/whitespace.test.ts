import { describe, expect, it } from 'vitest';
import {
  applyWhitespaceControl,
  getWhitespaceCompilerOptions,
  getWhitespaceRendererOptions,
  mergeWhitespaceOptions,
} from './whitespace';

describe('Whitespace Control', () => {
  it('should merge options with defaults', () => {
    const options = mergeWhitespaceOptions({ trim: true });

    expect(options.trim).toBe(true);
    expect(options.stripComments).toBe(false);
    expect(options.collapseWhitespace).toBe(false);
    expect(options.preserveNewlines).toBe(true);
  });

  it('should apply trim option', () => {
    const content = '  Hello World  ';
    const result = applyWhitespaceControl(
      content,
      mergeWhitespaceOptions({ trim: true }),
    );

    expect(result).toBe('Hello World');
  });

  it('should strip HTML comments', () => {
    const content = '<div><!-- Comment -->Hello</div>';
    const result = applyWhitespaceControl(
      content,
      mergeWhitespaceOptions({ stripComments: true }),
    );

    expect(result).toBe('<div>Hello</div>');
  });

  it('should collapse whitespace', () => {
    const content = '<div>  Hello    World  </div>';
    const result = applyWhitespaceControl(
      content,
      mergeWhitespaceOptions({ collapseWhitespace: true }),
    );

    expect(result).toBe('<div> Hello World </div>');
  });

  it('should preserve newlines when collapsing whitespace', () => {
    const content = '<div>  Hello\n  World  </div>';
    const result = applyWhitespaceControl(
      content,
      mergeWhitespaceOptions({
        collapseWhitespace: true,
        preserveNewlines: true,
      }),
    );

    expect(result).toBe('<div> Hello\n World </div>');
  });

  it('should not preserve newlines when collapsing whitespace', () => {
    const content = '<div>  Hello\n  World  </div>';
    const result = applyWhitespaceControl(
      content,
      mergeWhitespaceOptions({
        collapseWhitespace: true,
        preserveNewlines: false,
      }),
    );

    expect(result).toBe('<div> Hello World </div>');
  });

  it('should apply multiple options', () => {
    const content = '  <!-- Comment -->  Hello    World  ';
    const result = applyWhitespaceControl(
      content,
      mergeWhitespaceOptions({
        trim: true,
        stripComments: true,
        collapseWhitespace: true,
      }),
    );

    expect(result).toBe('Hello World');
  });

  it('should return compiler options', () => {
    const options = getWhitespaceCompilerOptions({ trim: true });

    expect(options.trimWhitespace).toBe(true);
    expect(options.stripComments).toBe(false);
  });

  it('should return renderer options', () => {
    const options = getWhitespaceRendererOptions({});

    expect(options).toEqual({});
  });
});
