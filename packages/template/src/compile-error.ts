import type { Token } from './types'
import c from 'tinyrainbow'

export class CompileError extends Error {
  constructor(
    message: string,
    private token: Token,
  ) {
    super(message)
    this.name = 'CompileError'
    Error.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    return `${c.bgRed(c.bold(' JianJia '))} ${c.red(this.message)}

${this.token.raw}
`
  }
}
