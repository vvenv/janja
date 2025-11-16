import { expect, it } from 'vitest'
import { unescapeTag } from './unescape-tag'

it('unescape \\{{ ', () => {
  expect(unescapeTag('{\\{ x }\\}')).toMatchInlineSnapshot(
    `"{{ x }}"`,
  )
})

it('unescape \\}} ', () => {
  expect(unescapeTag('\\{\\{ x \\}\\}')).toMatchInlineSnapshot(
    `"{{ x }}"`,
  )
})
