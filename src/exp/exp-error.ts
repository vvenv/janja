import type { Loc } from '../types';

export class ExpError extends SyntaxError {
  constructor(
    message: string,
    public loc: Loc,
  ) {
    super(message);
    this.name = 'ExpError';
    ExpError.captureStackTrace?.(this, this.constructor);
  }
}
