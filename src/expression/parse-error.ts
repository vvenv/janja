import type { Loc } from '../types'
import { highlightSource } from '../utils/highlight-source'

interface ParseErrorOptions {
  source: string
  loc: Loc
}

export class ParseError extends SyntaxError {
  constructor(
    message: string,
    private options: ParseErrorOptions,
  ) {
    super(message)
    this.name = 'ParseError'
    Error.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    return highlightSource(this.message, this.options.source, [this.options.loc])
  }
}
