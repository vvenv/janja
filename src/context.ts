import type { Config } from './types'
import { CONTEXT } from './identifiers'

export class Context {
  context = CONTEXT

  private index = 0
  private contexts: string[] = [CONTEXT]
  private expected: string[] = []

  constructor(public options: Config) {}

  in() {
    const len = this.contexts.push(`${this.context}_${this.index++}`)
    return (this.context = this.contexts[len - 1])
  }

  out() {
    if (this.context === CONTEXT) {
      return
    }
    this.contexts.pop()
    this.context = this.contexts[this.contexts.length - 1]
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
