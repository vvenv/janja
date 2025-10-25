import { Compiler } from '../compiler'
import { Parser } from '../parser'

export function compile(template: string) {
  return new Compiler().compile(new Parser().parse(template), 'c', 'f')
}

export function parse(template: string) {
  return new Parser().parse(template)
}
