import type { Loc } from './types'
import { CompileError } from './compile-error'

export class RenderError extends CompileError {
  constructor(
    message: string,
    protected src: string,
    protected getLoc: () => Loc,
  ) {
    super(message, src)
    this.name = 'CompileError'
    RenderError.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    this.loc = this.getLoc()
    return super.details
  }
}
