import { describe, expect, test } from 'vitest';
import { parse } from '../../test/__helper';

test('basic', async () => {
  expect(await parse('{{ #comment }}foo{{ /comment }}')).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";return s;})();"`,
  );

  expect(
    await parse('{{ #comment }}foo\nbar{{ /comment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";return s;})();"`,
  );
});

describe('w/o stripComments', async () => {
  test('basic', async () => {
    expect(
      await parse('{{ #comment }}foo{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      `""use strict";return (async ()=>{let s="";s+="<!--";s+="foo";s+="-->";return s;})();"`,
    );

    expect(
      await parse('{{ #comment }}foo\nbar{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      `""use strict";return (async ()=>{let s="";s+="<!--";s+="foo\\nbar";s+="-->";return s;})();"`,
    );
  });

  test('escape', async () => {
    expect(
      await parse('{{ #comment }}foo\n{{ name }}\nbar{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      `""use strict";return (async ()=>{let s="";s+="<!--";s+="foo\\n";s+=e(c.name);s+="\\nbar";s+="-->";return s;})();"`,
    );

    expect(
      await parse('{{ #comment }}foo\n\\{\\{ name \\}\\}\nbar{{ /comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      `""use strict";return (async ()=>{let s="";s+="<!--";s+="foo\\n{{ name }}\\nbar";s+="-->";return s;})();"`,
    );
  });
});
