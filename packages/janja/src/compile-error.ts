import {
  formatErrorWithSuggestions,
  getSuggestions,
} from './error-suggestions';
import { highlightSource } from './highlight-source';
import type { Loc } from './types';

export class CompileError extends SyntaxError {
  constructor(
    message: string,
    protected src: string,
    protected loc?: Loc,
    protected context?: string,
  ) {
    super(message);
    this.name = 'CompileError';
    CompileError.captureStackTrace?.(this, this.constructor);
  }

  get details() {
    const baseDetails = this.loc
      ? highlightSource(this.message, this.src, this.loc)
      : this.message;

    return formatErrorWithSuggestions(
      this.name,
      this.message,
      baseDetails,
      this.context,
    );
  }

  get suggestions() {
    return getSuggestions(this.name, this.message, this.context);
  }
}
