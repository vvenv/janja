import { CompileError } from './compile-error';
import type { Loc } from './types';

export class RenderError extends CompileError {
  constructor(
    message: string,
    protected src: string,
    protected getLoc: () => Loc,
  ) {
    super(message, src);
    this.name = 'CompileError';
    RenderError.captureStackTrace?.(this, this.constructor);
  }

  get details() {
    this.loc = this.getLoc();

    return super.details;
  }
}
