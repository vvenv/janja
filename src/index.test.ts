import { expect, it } from 'vitest'
import { render, renderFile } from '.'
import { loader } from './loaders/file-loader'

it('render', async () => {
  expect(
    await render('{{= name }}', { name: 'foo' }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
})

it('renderFile', async () => {
  expect(
    await renderFile('test.jianjia', { name: 'foo' }, {
      loader: path => loader(`test/${path}`),
    }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
})

it('renderFile w/ cache', async () => {
  expect(
    await renderFile('test.jianjia', { name: 'foo' }, {
      loader: path => loader(`test/${path}`),
      cache: true,
    }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
  expect(
    await renderFile('test.jianjia', { name: 'bar' }, {
      loader: path => loader(`test/${path}`),
      cache: true,
    }),
  ).toMatchInlineSnapshot(
    `"bar"`,
  )
})
