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

      1│ {{ for }}
       │ ^       ^
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

      1│ {{ for x }}
       │ ^         ^


      Suggestions:
        1. The for marker is not closed properly.
           Fix: Add the closing marker for for.
           Example: {{ ... }}"
    `);
  }

  try {
    await compile('{{ endfor }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unexpected "endfor"]`);
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endfor"

      1│ {{ endfor }}
       │ ^          ^


      Suggestions:
        1. An unexpected token was found in the template.
           Fix: Check your template syntax and ensure all markers are properly formatted."
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

      1│ {{ break }}
       │ ^         ^
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

      1│ {{ break x }}
       │ ^           ^
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

      1│ {{ continue }}
       │ ^            ^
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

      1│ {{ continue x }}
       │ ^              ^
      "
    `);
  }
});

it('for', async () => {
  expect(
    await compile('{{ for x of y }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.y,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_;s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  );
  expect(
    await compile('{{ for x of y | f }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=(r_=(f.f||u_("f")).call(c,c.y),r_ instanceof Promise?await r_:r_),a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_;s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for x of y | f(a) | g("b") }}{{= x }}{{= y }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=(r_=(f.g||u_("g")).call(c,(r_=(f.f||u_("f")).call(c,c.y,c.a),r_ instanceof Promise?await r_:r_),"b"),r_ instanceof Promise?await r_:r_),a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_;s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  );
});

it('destructuring', async () => {
  expect(
    await compile('{{ for (x, y) of z }}{{= x }}{{= y }}{{= z }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.z,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_.x;c_0.y=v_.y;s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}}return s;})();"`,
  );
  expect(
    await compile('{{ for (x=1, y="2") of z }}{{= x }}{{= y }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.z,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_.x===undefined?1:v_.x;c_0.y=v_.y===undefined?"2":v_.y;s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for (x, y) of z | f(a) }}{{= x }}{{= y }}{{= z }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=(r_=(f.f||u_("f")).call(c,c.z,c.a),r_ instanceof Promise?await r_:r_),a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_.x;c_0.y=v_.y;s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}}return s;})();"`,
  );
});

it('break', async () => {
  expect(
    await compile('{{ for name of names }}{{ break }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.names,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.name=v_;break;}}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ break }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.names,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.name=v_;if(c_0.name){break;}}}return s;})();"`,
  );
});

it('continue', async () => {
  expect(
    await compile('{{ for name of names }}{{ continue }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.names,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.name=v_;continue;}}return s;})();"`,
  );
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ continue }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.names,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.name=v_;if(c_0.name){continue;}}}return s;})();"`,
  );
});

it('nesting', async () => {
  expect(
    await compile(
      '{{ for x of y }}{{ for z of x }}{{= z }}{{= x }}{{= y }}{{ endfor }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.y,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_;{const t_=c_0.x,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;let i_=0;const c_0_1={...c_0};for(const v_ of a_){c_0_1.loop={first:i_===0,index:i_++,last:i_===n_};c_0_1.z=v_;s+=e(c_0_1.z);s+=e(c_0_1.x);s+=e(c_0_1.y);}}}}return s;})();"`,
  );
});

it('else', async () => {
  expect(
    await compile('{{ for x of y }}{{= x }}{{ else }}-{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};{const t_=c.y,a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;if(!n_){s+="-";}else{let i_=0;const c_0={...c};for(const v_ of a_){c_0.loop={first:i_===0,index:i_++,last:i_===n_};c_0.x=v_;s+=e(c_0.x);}}}return s;})();"`,
  );
});
