import type { Globals } from '../../src/types'
import { expect, it } from 'vitest'
import { render } from '../__helper'
import { formatDatetime as fd } from './format-datetime'

it('number', () => {
  expect(fd({}, 1746410588992, 'y')).toMatchInlineSnapshot('"2025"')
  expect(fd({}, 1746410588992, 'yy')).toMatchInlineSnapshot('"2025"')
  expect(fd({}, 1746410588992, 'yyy')).toMatchInlineSnapshot('"2025"')
  expect(fd({}, 1746410588992, 'yyyy')).toMatchInlineSnapshot('"2025"')
  expect(fd({}, 1746410588992, 'y M d h m s D')).toMatchInlineSnapshot(
    '"2025 5 5 2 3 8 Mon"',
  )
  expect(fd({}, 1746410588992, 'y MM dd hh mm ss DD')).toMatchInlineSnapshot(
    '"2025 05 05 02 03 08 Monday"',
  )
})

it('string', () => {
  expect(fd({}, '2021-01-01T02:03:08.992Z', 'y')).toMatchInlineSnapshot(
    '"2021"',
  )
  expect(fd({}, '2021-01-01T02:03:08.992Z', 'yy')).toMatchInlineSnapshot(
    '"2021"',
  )
  expect(fd({}, '2021-01-01T02:03:08.992Z', 'yyy')).toMatchInlineSnapshot(
    '"2021"',
  )
  expect(fd({}, '2021-01-01T02:03:08.992Z', 'yyyy')).toMatchInlineSnapshot(
    '"2021"',
  )
  expect(fd({}, '2021-01-01T02:03:08.992Z', 'N NN')).toMatchInlineSnapshot(
    '"Jan January"',
  )
  expect(
    fd({}, '2021-01-01T02:03:08.992Z', 'y M d h m s D'),
  ).toMatchInlineSnapshot('"2021 1 1 2 3 8 Fri"')
  expect(
    fd({}, '2021-01-01T02:03:08.992Z', 'y MM dd hh mm ss DD'),
  ).toMatchInlineSnapshot('"2021 01 01 02 03 08 Friday"')
})

it('translate', () => {
  expect(
    fd(
      { Jan: '一月', January: '一月', Mon: '一', Monday: '星期一' },
      '2021-01-01',
      'N NN D DD',
    ),
  ).toMatchInlineSnapshot('"一月 一月 Fri Friday"')
})

it('date', async () => {
  expect(
    await render('{{= x | date }}', { x: '2021-01-01' }, {
      filters: { date(this: Globals, value: string | number, format = 'yy-MM-dd hh:mm') { return fd(this.translations, value, format) } },
    }),
  ).toMatchInlineSnapshot(
    `"2021-01-01 00:00"`,
  )
  expect(
    await render('{{= x | date("y-M-d") }}', { x: '2021-01-01' }, {
      filters: { date(this: Globals, value: string | number, format = 'yy-MM-dd hh:mm') { return fd(this.translations, value, format) } },
    }),
  ).toMatchInlineSnapshot(
    `"2021-1-1"`,
  )
})

it('time', async () => {
  expect(
    await render('{{= x | time }}', { x: '2021-01-01' }, {
      filters: { time(this: Globals, value: string | number, format = 'hh:mm') { return fd(this.translations, value, format) } },
    }),
  ).toMatchInlineSnapshot(
    `"00:00"`,
  )
  expect(
    await render('{{= x | time("D") }}', { x: '2021-01-01' }, {
      filters: { time(this: Globals, value: string | number, format = 'hh:mm') { return fd(this.translations, value, format) } },
    }),
  ).toMatchInlineSnapshot(
    `"Fri"`,
  )
  expect(
    await render('{{= x | time("DD") }}', { x: '2021-01-01' }, {
      filters: { time(this: Globals, value: string | number, format = 'hh:mm') { return fd(this.translations, value, format) } },
    }),
  ).toMatchInlineSnapshot(
    `"Friday"`,
  )
})
