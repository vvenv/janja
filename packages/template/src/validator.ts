import type { Config } from './types'

export class Validator {
  expected: string[] = []

  constructor(public options: Required<Config>) {}

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
      throw new Error(`expected tokens ${this.expected.join(', ')}, but got nothing`)
    }
  }
}
