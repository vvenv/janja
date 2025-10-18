import type { Loc } from '@jj/utils'
import { highlightSource } from '@jj/utils'

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
