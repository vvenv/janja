import type { CompilerOptions, RendererOptions } from './types';

export interface WhitespaceOptions {
  trim?: boolean;
  stripComments?: boolean;
  collapseWhitespace?: boolean;
  preserveNewlines?: boolean;
}

export const defaultWhitespaceOptions: Required<WhitespaceOptions> = {
  trim: false,
  stripComments: false,
  collapseWhitespace: false,
  preserveNewlines: true,
};

export function mergeWhitespaceOptions(
  options?: WhitespaceOptions,
): Required<WhitespaceOptions> {
  return {
    ...defaultWhitespaceOptions,
    ...options,
  };
}

export function applyWhitespaceControl(
  content: string,
  options: Required<WhitespaceOptions>,
): string {
  let result = content;

  if (options.stripComments) {
    // Remove HTML comments
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (options.collapseWhitespace) {
    if (!options.preserveNewlines) {
      // Collapse all whitespace
      result = result.replace(/\s+/g, ' ');
    } else {
      // Collapse whitespace but preserve newlines
      result = result.replace(/[ \t]+/g, ' ');
    }
  }

  if (options.trim) {
    result = result.trim();
  }

  return result;
}

export function getWhitespaceCompilerOptions(
  options: WhitespaceOptions,
): Partial<CompilerOptions> {
  const merged = mergeWhitespaceOptions(options);

  return {
    trimWhitespace: merged.trim,
    stripComments: merged.stripComments,
  };
}

export function getWhitespaceRendererOptions(
  options: WhitespaceOptions,
): Partial<RendererOptions> {
  const merged = mergeWhitespaceOptions(options);

  const result: Partial<RendererOptions> = {};

  if (merged.trim !== defaultWhitespaceOptions.trim) {
    result.trimWhitespace = merged.trim;
  }

  if (merged.stripComments !== defaultWhitespaceOptions.stripComments) {
    result.stripComments = merged.stripComments;
  }

  return result;
}
