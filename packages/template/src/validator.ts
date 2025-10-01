import type { Config } from './types'

export class Validator {
  expected: string[][] = []

  constructor(public options: Required<Config>) {}

  expect(names: string[]) {
    this.expected.push(names)
  }

  matchAny(names: string[]) {
    return this.expected.some(e => e.some(name => names.includes(name)))
  }

  match(names: string[]) {
    return this.expected.at(-1)?.some(name => names.includes(name))
  }

  consume(names: string[]) {
    if (this.match(names)) {
      this.expected.pop()

      return true
    }

    return false
  }

  validate() {
    if (this.expected.length) {
      throw new Error(`expected tokens ${this.expected.flatMap(e => e).join(', ')}, but got nothing`)
    }
  }
}
