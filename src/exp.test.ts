import { expect, it } from 'vitest'
import { compiler, ExpCompiler, ExpParser, parser } from './exp'

it('invalid', () => {
  expect(ExpCompiler).toBeDefined()
  expect(ExpParser).toBeDefined()
  expect(compiler).toBeDefined()
  expect(parser).toBeDefined()
})
