import type { Config } from './types'
import { CONTEXT } from './identifiers'

export class Context {
  context = CONTEXT

  private index = 0
  private contexts: string[] = [CONTEXT]
  private expected: string[] = []

  constructor(public options: Config) {}

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

  expect(name: string) {
    this.expected.push(name)
  }

  matchAny(name: string) {
    return this.expected.includes(name)
  }

  match(name: string) {
    return this.expected.at(-1) === name
  }

  consume(name: string) {
    if (this.match(name)) {
      this.expected.pop()

      return true
    }

    return false
  }

  validate() {
    if (this.expected.length) {
      throw new Error(`expected tokens "${this.expected.join(', ')}", but got nothing`)
    }
  }
}
