import type { Tag } from './types'
import { highlightSource } from './highlight-source'

export class CompileError extends Error {
  constructor(
    message: string,
    private token: Tag,
    filepath?: string,
  ) {
    super(filepath ? `${message} at ${filepath}` : message)
    this.name = 'CompileError'
    Error.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    return highlightSource(this.message, this.token.raw, [this.token])
  }
}
