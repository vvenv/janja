import { expect, test } from 'vitest';
import { parse } from '../../test/__helper';

test('basic', async () => {
  expect(await parse('{{ > }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";s+=e("{{ > }}");return s;})();"`,
  );
  expect(await parse('{{ < }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";s+=e("{{ < }}");return s;})();"`,
  );
  expect(await parse('{{ alert("XSS") }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";s+=e("{{ alert(\\"XSS\\") }}");return s;})();"`,
  );
  expect(await parse('{{ window.alert("XSS") }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";s+=e("{{ window.alert(\\"XSS\\") }}");return s;})();"`,
  );
  expect(await parse('{{ #x }}{{ /x }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";s+=e("{{ #x }}");s+=e("{{ /x }}");return s;})();"`,
  );
  // cspell: disable-next-line
  expect(await parse('{{ x }}{{ endx }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";s+=e(c.x);s+=e(c.endx);return s;})();"`,
  );
});
