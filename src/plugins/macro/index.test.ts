import { expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('error', async () => {
  try {
    await compile('{{ macro }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "macro" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""macro" requires expression

      1｜ {{ macro }}
       ｜ ^         ^
      "
    `);
  }

  try {
    await compile('{{ endmacro }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endmacro"]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endmacro"

      1｜ {{ endmacro }}
       ｜ ^            ^
      "
    `);
  }

  try {
    await compile('{{ macro 1 }}{{ endmacro }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
    `[CompileError: Invalid macro definition]`);
    expect(error.details).toMatchInlineSnapshot(`
      "Invalid macro definition

      1｜ {{ macro 1 }}{{ endmacro }}
       ｜ ^           ^
      "
    `);
  }

  try {
    await compile('{{ caller }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "caller" directive used outside of a macro]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""caller" directive used outside of a macro

      1｜ {{ caller }}
       ｜ ^          ^
      "
    `);
  }
});

it('macro', async () => {
  expect(
    await compile('{{ macro m }}MACRO{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=()=>async(_c)=>{const c_0={...c,};s+="MACRO";};return s;})();"`
  );
  expect(
    await compile('{{ macro m = () }}MACRO{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=()=>async(_c)=>{const c_0={...c,};s+="MACRO";};return s;})();"`,
  );
  expect(
    await compile('{{ macro m = () }}1{{ caller }}2{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=()=>async(_c)=>{const c_0={...c,};s+="1";await _c?.();s+="2";};return s;})();"`,
  );
  expect(
    await compile('{{ macro m = (x, y) }}{{= x }}{{= y }}{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=(x,y)=>async(_c)=>{const c_0={...c,x,y};s+=e(c_0.x);s+=e(c_0.y);};return s;})();"`,
  );
  expect(
    await compile(
      '{{ macro m = (x="=", y=1, z=x) }}{{= x }}{{= y }}{{= z }}{{ endmacro }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.m=(x="=",y=1,z=c.x)=>async(_c)=>{const c_0={...c,x,y,z};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);};return s;})();"`,
  );
});
