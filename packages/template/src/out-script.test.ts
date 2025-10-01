import type { Config } from './types'
import { expect, it } from 'vitest'
import { config } from './config'
import { OutScript } from './out-script'

function _out(options?: Partial<Config>) {
  return new OutScript({ ...config, ...options })
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
