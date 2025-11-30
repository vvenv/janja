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
      `[CompileError: Unexpected "endfor"]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endfor"

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

it('for', async () => {
  expect(
    await compile('{{ for x of y }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.y,n_=a_.length;let i_=0;for(const x of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,};s+=e(c_0.x);s+=e(c_0.y);}};return s;})();"`,
  );
  expect(
    await compile('{{ for x of y | f }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=(await f.f.call(c,c.y)),n_=a_.length;let i_=0;for(const x of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,};s+=e(c_0.x);s+=e(c_0.y);}};return s;})();"`,
  );
  expect(
    await compile(
      '{{ for x of y | f(a) | g("b") }}{{= x }}{{= y }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=(await f.g.call(c,(await f.f.call(c,c.y,c.a)),"b")),n_=a_.length;let i_=0;for(const x of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,};s+=e(c_0.x);s+=e(c_0.y);}};return s;})();"`,
  );
});

it('destructuring', async () => {
  expect(
    await compile('{{ for (x, y) of z }}{{= x }}{{= y }}{{= z }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.z,n_=a_.length;let i_=0;for(const {x,y} of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,y,};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}};return s;})();"`,
  );
  expect(
    await compile('{{ for (x=1, y="2") of z }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.z,n_=a_.length;let i_=0;for(const {x=1,y="2"} of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,y,};s+=e(c_0.x);s+=e(c_0.y);}};return s;})();"`,
  );
  expect(
    await compile(
      '{{ for (x, y) of z | f(a) }}{{= x }}{{= y }}{{= z }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=(await f.f.call(c,c.z,c.a)),n_=a_.length;let i_=0;for(const {x,y} of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,y,};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}};return s;})();"`,
  );
});

it('break', async () => {
  expect(
    await compile('{{ for name of names }}{{ break }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.names,n_=a_.length;let i_=0;for(const name of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},name,};break;}};return s;})();"`,
  );
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ break }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.names,n_=a_.length;let i_=0;for(const name of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},name,};if(c_0.name){break;}}};return s;})();"`,
  );
});

it('continue', async () => {
  expect(
    await compile('{{ for name of names }}{{ continue }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.names,n_=a_.length;let i_=0;for(const name of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},name,};continue;}};return s;})();"`,
  );
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ continue }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.names,n_=a_.length;let i_=0;for(const name of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},name,};if(c_0.name){continue;}}};return s;})();"`,
  );
});

it('nesting', async () => {
  expect(
    await compile(
      '{{ for x of y }}{{ for z of x }}{{= z }}{{= x }}{{= y }}{{ endfor }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";{const a_=c.y,n_=a_.length;let i_=0;for(const x of a_){const c_0={...c,loop:{first:i_===0,index:i_++,last:i_===n_,},x,};{const a_=c_0.x,n_=a_.length;let i_=0;for(const z of a_){const c_0_1={...c_0,loop:{first:i_===0,index:i_++,last:i_===n_,},z,};s+=e(c_0_1.z);s+=e(c_0_1.x);s+=e(c_0_1.y);}};}};return s;})();"`,
  );
});
