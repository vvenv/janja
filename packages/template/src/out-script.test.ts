import type { EngineOptions } from './types'
import { expect, it } from 'vitest'
import { defaultOptions } from './engine'
import { OutScript } from './out-script'

function _out(options?: Partial<EngineOptions>) {
  return new OutScript({ ...defaultOptions, ...options })
}

it('escape \\', () => {
  const out = _out()

  out.pushStr('\\')
  expect(out.value).toMatchInlineSnapshot('"s+="\\\\";"')
})

it('escape \\n', () => {
  const out = _out()

  out.pushStr('\n')
  expect(out.value).toMatchInlineSnapshot('"s+="\\n";"')
})

it('escape "', () => {
  const out = _out()

  out.pushStr('"')
  expect(out.value).toMatchInlineSnapshot('"s+="\\"";"')
})

it('escape \\{{ ', () => {
  const out = _out()

  out.pushStr('\\{{ x }}')
  expect(out.value).toMatchInlineSnapshot('"s+="{{ x }}";"')
})

it('escape dynamic values with external function', () => {
  const out = _out()

  out.pushVar('x')
  expect(out.value).toMatchInlineSnapshot('"s+=e(x);"')
})
