import type { SourceMap } from './source-map'
import { highlightSource } from './utils/highlight-source'

interface RuntimeErrorOptions {
  source: string
  error: Error
  sourcemap: SourceMap
}

export class RuntimeError extends Error {
  constructor(
    message: string,
    private options: RuntimeErrorOptions,
  ) {
    super(message)
    this.name = 'RuntimeError'
    Error.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    const nodes = this.options.sourcemap.getLocations(
      +(this.options.error.stack!.match(/<anonymous>:\d:(\d+)\)/)?.[1] ?? 0),
    )

    return highlightSource(this.message, this.options.source, nodes)
  }
}
