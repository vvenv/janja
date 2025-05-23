import type { Location } from './types'
import { highlightSource } from './utils/highlight-source'

interface ParserErrorOptions {
  template: string
  nodes: Location[]
}

export class ParserError extends SyntaxError {
  constructor(
    message: string,
    private options: ParserErrorOptions,
  ) {
    super(message)
    this.name = 'ASTError'
    SyntaxError.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    return highlightSource(
      this.message,
      this.options.template,
      this.options.nodes,
    )
  }
}
