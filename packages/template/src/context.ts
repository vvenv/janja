import type { EngineOptions } from './types'
import { CONTEXT } from './config'

export class Context {
  context = CONTEXT

  private contexts: string[] = [CONTEXT]

  constructor(public options: Required<EngineOptions>) {}

  affix(affix: string | number) {
    const len = this.contexts.push(`${this.context}_${affix}`)
    return (this.context = this.contexts[len - 1])
  }

  reset() {
    if (this.context === CONTEXT) {
      return
    }
    this.contexts.pop()
    this.context = this.contexts[this.contexts.length - 1]
  }
}
