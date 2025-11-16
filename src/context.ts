import { CONTEXT } from './identifiers'
import { OutScript } from './out-script'

export class Context extends OutScript {
  context = CONTEXT

  private contexts: string[] = [CONTEXT]
  private index = 0

  constructor() {
    super()
  }

  in() {
    this.context = `${this.context}_${this.index++}`
    this.contexts.push(this.context)
    return this.context
  }

  out() {
    if (this.context === CONTEXT) {
      return
    }
    this.contexts.pop()
    this.context = this.contexts.at(-1) ?? CONTEXT
  }
}
