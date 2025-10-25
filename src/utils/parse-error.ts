import type { Range } from '../types'
import { highlightSource } from '../utils/highlight-source'

interface ParseErrorOptions {
  source: string
  loc: Range
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
