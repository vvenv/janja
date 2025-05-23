import { describe, expect, test } from 'vitest';
import { parse } from '../../test/__helper';

test('basic', async () => {
  expect(
    await parse(
      `{{ #block title }}1{{ /block }}{{ #block title }}2{{ /block }}{{ #block title }}{{ super() }}3{{ /block }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return (async ()=>{let s="";const _b_1_0_0=async(_s)=>{s+="1";};const _b_1_0_31=async(_s)=>{s+="2";};const _b_1_0_62=async(_s)=>{await _s?.();s+="3";};await (async()=>await _b_1_0_62(async()=>await _b_1_0_31(async()=>await _b_1_0_0())))();return s;})();"`,
  );
});

describe('validation', async () => {
  test('"block" must follow "root"', async () => {
    expect(
      await parse(`{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return (async ()=>{let s="";if(c.x){s+="{{ #block title }}{{ /block }}";}return s;})();"`,
    );

    expect(
      await parse(`{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}`, {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`
      " i>j>k  "block" must follow "root", not "if".

      1: {{ #if x }}{{ #block title }}{{ /block }}{{ /if }}
         ^^^^^^^^^^^
                    ^^^^^^^^^^^^^^^^^^
      "
    `);
  });

  test('"super" must follow "block"', async () => {
    expect(
      await parse(`{{ #if x }}{{ super() }}{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return (async ()=>{let s="";if(c.x){s+="{{ super() }}";}return s;})();"`,
    );

    expect(await parse(`{{ #if x }}{{ super() }}{{ /if }}`, { debug: true }))
      .toMatchInlineSnapshot(`
        " i>j>k  "super" must follow "block", not "if".

        1: {{ #if x }}{{ super() }}{{ /if }}
           ^^^^^^^^^^^
                      ^^^^^^^^^^^^^
        "
      `);
  });
});
