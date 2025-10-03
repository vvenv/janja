import { expect, it } from 'vitest'
import { render, renderFile } from '.'
import { config } from './config'

it('render', async () => {
  expect(await render('{{= name }}', { name: 'foo' })).toMatchInlineSnapshot(
    '"foo"',
  )
})

it('renderFile', async () => {
  expect(await renderFile('test.jianjia', { name: 'foo' }, {
    loader: path => config.loader(`test/${path}`),
  })).toMatchInlineSnapshot(
    '"foo"',
  )
})

it('renderFile w/ cache', async () => {
  expect(await renderFile('test.jianjia', { name: 'foo' }, {
    loader: path => config.loader(`test/${path}`),
    cache: true,
  })).toMatchInlineSnapshot(
    '"foo"',
  )
  expect(await renderFile('test.jianjia', { name: 'bar' }, {
    loader: path => config.loader(`test/${path}`),
    cache: true,
  })).toMatchInlineSnapshot(
    '"bar"',
  )
})
