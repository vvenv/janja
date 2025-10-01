import type { Token } from './types'
import c from 'tinyrainbow'

export class CompileError extends Error {
  constructor(
    message: string,
    private token: Token,
    private filepath?: string,
  ) {
    super(message)
    this.name = 'CompileError'
    Error.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    return `${c.bgRed(c.bold(' JianJia '))} ${c.red(this.message)}

${this.token.raw}

${this.filepath ? `at ${this.filepath}:` : ''}${this.token.start}:${this.token.end}`
  }
}
