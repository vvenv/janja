import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('{{! foo }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="<!--foo-->";return s;})();"',
  )
  expect(await compile('{{! foo\nbar }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="<!--foo\\nbar-->";return s;})();"',
  )
  expect(await compile('{{ #comment }}foo{{ /comment }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="<!--";s+="foo";s+="-->";return s;})();"',
  )
  expect(
    await compile('{{ #comment }}foo\nbar{{ /comment }}'),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\nbar";s+="-->";return s;})();"',
  )
})

describe('w/o stripComments', async () => {
  it('basic', async () => {
    expect(
      await compile('{{! foo }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--foo-->";return s;})();"',
    )

    expect(
      await compile('{{! foo\nbar }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--foo\\nbar-->";return s;})();"',
    )

    expect(
      await compile('{{ #comment }}foo{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--";s+="foo";s+="-->";return s;})();"',
    )

    expect(
      await compile('{{ #comment }}foo\nbar{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\nbar";s+="-->";return s;})();"',
    )
  })

  it('escape', async () => {
    expect(
      await compile('{{ #comment }}foo\n{{= name }}\nbar{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\n";s+=e(c.name);s+="\\nbar";s+="-->";return s;})();"',
    )

    expect(
      await compile('{{ #comment }}foo\n\\{\\{= name \\}\\}\nbar{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\n{{= name }}\\nbar";s+="-->";return s;})();"',
    )
  })
})
