import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(
    await compile(
      '{{ #block title }}1{{ /block }}{{ #block title }}2{{ /block }}{{ #block title }}{{ super }}3{{ /block }}',
    ),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="2";s+="3";return s;})();"',
  )
  expect(
    await compile(
      '{{ #block title }}1{{ /block }}{{ #block title }}2{{ super }}{{ /block }}{{ #block title }}{{ super }}3{{ /block }}',
    ),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="2";s+="1";s+="3";return s;})();"',
  )
  expect(
    await compile(
      ' {{- #block title }} 1 {{- /block }} {{ #block title -}} 2 {{ super -}} {{ /block -}} {{- #block title -}} {{- super -}} 3 {{- /block -}} ',
    ),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="2";s+=" 1";s+=" ";s+="3";s+=" ";s+=" ";return s;})();"',
  )
})

it('whitespace control', async () => {
  expect(
    await compile(' {{ #block name }} x {{ /block }} '),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" ";s+=" x ";s+=" ";return s;})();"',
  )
  expect(
    await compile(' {{ #block name -}} x {{- /block }} '),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" ";s+="x";s+=" ";return s;})();"',
  )
  expect(
    await compile(' {{- #block name -}} x {{- /block -}} '),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="x";return s;})();"',
  )
  expect(
    await compile(' {{- #block name -}} x {{ super }} y {{- /block -}} '),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="x ";s+=" y";return s;})();"',
  )
  expect(
    await compile(' {{- #block name -}} x {{- super -}} y {{- /block -}} '),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="x";s+="y";return s;})();"',
  )
  expect(
    await compile(' {{- #block name }} x {{- super -}} y {{ /block -}} '),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" x";s+="y ";return s;})();"',
  )
})

it('invalid', async () => {
  expect(
    await compile('{{ #block }}{{ /block }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `"block tag must have a value"`,
  )
  expect(
    await compile('{{ #block }}{{ /block }}', {
      debug: true,
    }),
  ).toMatchInlineSnapshot(`"block tag must have a value"`)
  expect(
    await compile('{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
  expect(
    await compile('{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}', {
      debug: true,
    }),
  ).toMatchInlineSnapshot(`""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`)
  expect(
    await compile('{{ #if x }}{{ super }}{{ /if }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
  expect(
    await compile('{{ #if x }}{{ super }}{{ /if }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
})
