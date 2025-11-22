import { expect, it } from 'vitest';
import { compile } from '../../test/__helper';

it('error', async () => {
  try {
    await compile('{{ call }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "call" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""call" requires expression

      1｜ {{ call }}
       ｜ ^        ^
      "
    `);
  }

  try {
    await compile('{{ call m }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unclosed "call"]`);
    expect(error.details).toMatchInlineSnapshot(`
      "Unclosed "call"

      1｜ {{ call m }}
       ｜ ^          ^
      "
    `);
  }

  try {
    await compile('{{ endcall }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endcall" directive]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endcall" directive

      1｜ {{ endcall }}
       ｜ ^           ^
      "
    `);
  }
});

it('call', async () => {
  expect(await compile('{{ call m() }}{{ endcall }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";await c.m()(async()=>{});return s;})();"`,
  );
  expect(
    await compile('{{ call m(1, "2") }}3{{ endcall }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";await c.m(1,"2")(async()=>{s+="3";});return s;})();"`,
  );
});

it('macro and call', async () => {
  expect(
    await compile(
      "{{ macro m = (x, y) }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}{{ call m('f', 1) }}2{{ endcall }}",
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=(x,y)=>async(_c)=>{const c_0={...c,x,y};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};await c.m("f",1)(async()=>{s+="2";});return s;})();"`,
  );
  expect(
    await compile(
      "{{ macro m = (x='f', y=1) }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}{{ call m() }}2{{ endcall }}",
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=(x="f",y=1)=>async(_c)=>{const c_0={...c,x,y};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};await c.m()(async()=>{s+="2";});return s;})();"`,
  );
});
