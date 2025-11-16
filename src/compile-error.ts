import type { Loc } from './types'
import { highlightSource } from './highlight-source'

export class CompileError extends SyntaxError {
  constructor(
    message: string,
    protected src: string,
    protected loc?: Loc,
  ) {
    super(message)
    this.name = 'CompileError'
    CompileError.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    return this.loc
      ? highlightSource(this.message, this.src, this.loc)
      : this.message
  }
}
