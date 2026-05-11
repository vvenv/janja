import type { ObjectType } from './types';

export interface ErrorRecoveryOptions {
  /**
   * Whether to continue rendering when an error occurs
   */
  continueOnError?: boolean;

  /**
   * Fallback value to use when a variable is undefined
   */
  undefinedFallback?: any;

  /**
   * Whether to ignore missing filters
   */
  ignoreMissingFilters?: boolean;

  /**
   * Custom error handler for rendering errors
   */
  onError?: (error: Error, context: ErrorContext) => any;
}

export interface ErrorContext {
  template: string;
  data: ObjectType;
  expression?: string;
  filter?: string;
}

export class ErrorRecovery {
  private options: Required<ErrorRecoveryOptions>;

  constructor(options: ErrorRecoveryOptions = {}) {
    this.options = {
      continueOnError: false,
      undefinedFallback: '',
      ignoreMissingFilters: false,
      onError: () => undefined,
      ...options,
    };
  }

  /**
   * Safely evaluate an expression with error recovery
   */
  safeEvaluate(
    expression: string,
    data: ObjectType,
    context: Partial<ErrorContext> = {},
  ): any {
    try {
      // This is a simplified evaluation - in a real implementation,
      // you would use the expression evaluator
      const result = this.evaluateExpression(expression, data);

      if (
        result === undefined &&
        this.options.undefinedFallback !== undefined
      ) {
        return this.options.undefinedFallback;
      }

      return result;
    } catch (error) {
      const errorContext: ErrorContext = {
        template: context.template || '',
        data,
        expression,
      };

      const recovered = this.options.onError(error as Error, errorContext);

      if (this.options.continueOnError) {
        return recovered;
      }

      throw error;
    }
  }

  /**
   * Safely apply a filter with error recovery
   */
  safeApplyFilter(
    value: any,
    filterName: string,
    filterFn: ((value: any, ...args: any[]) => any) | undefined,
    args: any[] = [],
    context: Partial<ErrorContext> = {},
  ): any {
    try {
      if (!filterFn) {
        if (this.options.ignoreMissingFilters) {
          return value;
        }

        throw new Error(`Filter "${filterName}" is not defined`);
      }

      return filterFn(value, ...args);
    } catch (error) {
      const errorContext: ErrorContext = {
        template: context.template || '',
        data: context.data || {},
        filter: filterName,
      };

      const recovered = this.options.onError(error as Error, errorContext);

      if (this.options.continueOnError) {
        return recovered;
      }

      throw error;
    }
  }

  /**
   * Wrap a rendering function with error recovery
   */
  wrapRender<T extends (...args: any[]) => any>(
    fn: T,
    context: Partial<ErrorContext> = {},
  ): T {
    return ((...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        const errorContext: ErrorContext = {
          template: context.template || '',
          data: args[1] || {},
        };

        const recovered = this.options.onError(error as Error, errorContext);

        if (this.options.continueOnError) {
          return recovered;
        }

        throw error;
      }
    }) as T;
  }

  /**
   * Simple expression evaluation (placeholder for actual expression evaluator)
   */
  private evaluateExpression(expression: string, data: ObjectType): any {
    // This is a simplified version - in production, use the actual expression evaluator
    try {
      // Try to evaluate as a property access
      const parts = expression.split('.');

      let result: any = data;

      for (const part of parts) {
        if (result == null) {
          return undefined;
        }

        result = result[part];
      }

      return result;
    } catch {
      return undefined;
    }
  }

  /**
   * Create a safe data accessor that handles undefined paths
   */
  createSafeAccessor(data: ObjectType): (path: string) => any {
    return (path: string) => {
      try {
        const parts = path.split('.');

        let result: any = data;

        for (const part of parts) {
          if (result == null) {
            return this.options.undefinedFallback;
          }

          result = result[part];
        }

        if (result === undefined) {
          return this.options.undefinedFallback;
        }

        return result;
      } catch {
        return this.options.undefinedFallback;
      }
    };
  }
}

/**
 * Default error handler that logs to console
 */
export function defaultErrorHandler(error: Error, context: ErrorContext): void {
  console.error('[Janja Error]', error.message);

  if (context.expression) {
    console.error('  Expression:', context.expression);
  }

  if (context.filter) {
    console.error('  Filter:', context.filter);
  }
}

/**
 * Create error recovery options with defaults
 */
export function createErrorRecovery(
  options: ErrorRecoveryOptions = {},
): ErrorRecovery {
  return new ErrorRecovery(options);
}
