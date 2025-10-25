import type { SourceMap } from './source-map'
import { highlightSource } from './highlight-source'

interface RenderErrorOptions {
  source: string
  error: Error
  sourcemap: SourceMap
}

export class RenderError extends Error {
  constructor(
    message: string,
    private options: RenderErrorOptions,
  ) {
    super(message)
    this.name = 'RenderError'
    Error.captureStackTrace?.(this, this.constructor)
  }

  get details() {
    const ranges = this.options.sourcemap.getRanges(
      +(this.options.error.stack!.match(/<anonymous>:\d:(\d+)\)/)?.[1] ?? 0),
    )

    return highlightSource(this.message, this.options.source, ranges)
  }
}
