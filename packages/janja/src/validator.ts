import * as filters from './filters';
import { compilerOptions, mergeOptions } from './options';
import { Parser } from './parser';
import { plugins } from './plugins';
import type { CompilerOptions } from './types';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates templates by running them through the real parser, so it reports
 * exactly the syntax errors that rendering would.
 */
export class TemplateValidator {
  constructor(private options: CompilerOptions = {}) {}

  async validate(template: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const report = (error: any) => {
      const [suggestion] = error?.suggestions ?? [];

      errors.push({
        type: 'error',
        message: `${error?.message ?? error}`,
        line: error?.loc?.start.line,
        column: error?.loc?.start.column,
        suggestion: suggestion?.fix ?? suggestion?.message,
      });
    };

    const options = mergeOptions(
      compilerOptions,
      { filters, plugins },
      this.options,
      { debug: report },
    );

    try {
      const root = new Parser(options).parse(template);

      this.checkFilters(root, options.filters, warnings);
    } catch (error) {
      report(error);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Unknown filters only fail once the expression using them is evaluated
  private checkFilters(
    node: any,
    known: Record<string, unknown>,
    warnings: ValidationError[],
    seen = new Set<object>(),
  ) {
    if (!node || typeof node !== 'object' || seen.has(node)) {
      return;
    }

    seen.add(node);

    if (
      node.type === 'PIPE' &&
      node.right?.type === 'ID' &&
      !Object.prototype.hasOwnProperty.call(known, node.right.value)
    ) {
      warnings.push({
        type: 'warning',
        message: `Unknown filter "${node.right.value}"`,
        line: node.right.loc?.start.line,
        column: node.right.loc?.start.column,
      });
    }

    for (const value of Object.values(node)) {
      this.checkFilters(value, known, warnings, seen);
    }
  }
}

export async function validateTemplate(
  template: string,
  options?: CompilerOptions,
): Promise<ValidationResult> {
  return new TemplateValidator(options).validate(template);
}
