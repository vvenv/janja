import { expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('error', async () => {
  try {
    await compile('{{ for }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "for" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""for" requires expression

      1｜ {{ for }}
       ｜ ^       ^
      "
    `);
  }

  try {
    await compile('{{ for x }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unclosed "for"]`);
    expect(error.details).toMatchInlineSnapshot(`
      "Unclosed "for"

      1｜ {{ for x }}
       ｜ ^         ^
      "
    `);
  }

  try {
    await compile('{{ endfor }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endfor" directive]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endfor" directive

      1｜ {{ endfor }}
       ｜ ^          ^
      "
    `);
  }

  try {
    await compile('{{ break }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "break" directive used outside of a loop]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""break" directive used outside of a loop

      1｜ {{ break }}
       ｜ ^         ^
      "
    `);
  }

  try {
    await compile('{{ break x }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "break" should not have expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""break" should not have expression

      1｜ {{ break x }}
       ｜ ^           ^
      "
    `);
  }

  try {
    await compile('{{ continue }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "continue" directive used outside of a loop]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""continue" directive used outside of a loop

      1｜ {{ continue }}
       ｜ ^            ^
      "
    `);
  }

  try {
    await compile('{{ continue x }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "continue" should not have expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""continue" should not have expression

      1｜ {{ continue x }}
       ｜ ^              ^
      "
    `);
  }
});

it('basic', async () => {
  expect(
    await compile('{{ for x of y }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const x of c.y){const c_0={...c,x,};s+=e(c_0.x);s+=e(c_0.y);}return s;})();"`,
  );
  expect(
    await compile('{{ for x of y | f }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const x of (await f.f.call(c,c.y))){const c_0={...c,x,};s+=e(c_0.x);s+=e(c_0.y);}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for x of y | f(a) | g("b") }}{{= x }}{{= y }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const x of (await f.g.call(c,(await f.f.call(c,c.y,c.a)),"b"))){const c_0={...c,x,};s+=e(c_0.x);s+=e(c_0.y);}return s;})();"`,
  );
});

it('destructuring', async () => {
  expect(
    await compile('{{ for (x, y) of z }}{{= x }}{{= y }}{{= z }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const {x,y} of c.z){const c_0={...c,x,y,};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for (x, y) of z | f(a) }}{{= x }}{{= y }}{{= z }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const {x,y} of (await f.f.call(c,c.z,c.a))){const c_0={...c,x,y,};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}return s;})();"`,
  );
});

it('break', async () => {
  expect(
    await compile('{{ for name of names }}{{ break }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const name of c.names){const c_0={...c,name,};break;}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ break }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const name of c.names){const c_0={...c,name,};if(c_0.name){break;}}return s;})();"`,
  );
});

it('continue', async () => {
  expect(
    await compile('{{ for name of names }}{{ continue }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const name of c.names){const c_0={...c,name,};continue;}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ continue }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const name of c.names){const c_0={...c,name,};if(c_0.name){continue;}}return s;})();"`,
  );
});

it('nesting', async () => {
  expect(
    await compile(
      '{{ for x of y }}{{ for z of x }}{{= z }}{{= x }}{{= y }}{{ endfor }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";for(const x of c.y){const c_0={...c,x,};for(const z of c_0.x){const c_0_1={...c_0,z,};s+=e(c_0_1.z);s+=e(c_0_1.x);s+=e(c_0_1.y);}}return s;})();"`,
  );
});
