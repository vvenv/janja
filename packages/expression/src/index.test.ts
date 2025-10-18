import { expect, it } from 'vitest'
import { Compiler, compiler, Parser, parser } from '.'

it('invalid', () => {
  expect(Compiler).toBeDefined()
  expect(Parser).toBeDefined()
  expect(compiler).toBeDefined()
  expect(parser).toBeDefined()
})
