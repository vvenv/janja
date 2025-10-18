import { expect, it } from 'vitest'
import { compile } from '../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ block }}{{ endblock }}')
  }
  catch (error) {
    expect(
      error,
    ).toMatchInlineSnapshot(
      `[TypeError: Cannot destructure property 'type' of 'token.value' as it is null.]`,
    )
  }
  try {
    await compile('{{ if x }}{{ block title }}{{ endblock }}{{ endif }}')
  }
  catch (error) {
    expect(
      error,
    ).toMatchInlineSnapshot(
      `[ParseError: block tag must have a title]`,
    )
  }
  expect(
    await compile('{{ block title }}1{{ endblock }}{{ if x }}{{ block title }}1{{ endblock }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="1";if(c.x){}return s;})();"`,
  )
  expect(
    await compile('{{ if x }}{{ block title }}{{ endblock }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
  expect(
    await compile('{{ if x }}{{ super }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
  expect(
    await compile('{{ if x }}{{ super }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
})

it('basic', async () => {
  expect(
    await compile(
      '{{ block title }}1{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="1";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}{{ super }}{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}{{ super }}{{ endblock }}{{ block title }}{{ super }}{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}1{{ endblock }}{{ block title }}2{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="2";s+="3";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}1{{ endblock }}{{ block title }}2{{ super }}{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="2";s+="1";s+="3";return s;})();"`,
  )
  expect(
    await compile(
      ' {{- block title }} 1 {{- endblock }} {{ block title -}} 2 {{ super -}} {{ endblock -}} {{- block title -}} {{- super -}} 3 {{- endblock -}} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="2";s+=" 1";s+=" ";s+="3";s+=" ";s+=" ";return s;})();"`,
  )
})

it('whitespace control', async () => {
  expect(
    await compile(' {{ block name }} x {{ endblock }} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" ";s+=" x ";s+=" ";return s;})();"`,
  )
  expect(
    await compile(' {{ block name -}} x {{- endblock }} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" ";s+="x";s+=" ";return s;})();"`,
  )
  expect(
    await compile(' {{- block name -}} x {{- endblock -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="x";return s;})();"`,
  )
  expect(
    await compile(' {{- block name -}} x {{ super }} y {{- endblock -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="x ";s+=" y";return s;})();"`,
  )
  expect(
    await compile(' {{- block name -}} x {{- super -}} y {{- endblock -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="x";s+="y";return s;})();"`,
  )
  expect(
    await compile(' {{- block name }} x {{- super -}} y {{ endblock -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" x";s+="y ";return s;})();"`,
  )
})
