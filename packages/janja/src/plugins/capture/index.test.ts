import { expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('error', async () => {
  try {
    await compile('{{ capture }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "capture" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      ""capture" requires expression

      1｜ {{ capture }}
       ｜ ^           ^
      "
    `);
  }

  try {
    await compile('{{ capture x }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unclosed "capture"]`);
    expect(error.details).toMatchInlineSnapshot(`
      "Unclosed "capture"

      1｜ {{ capture x }}
       ｜ ^             ^
      "
    `);
  }

  try {
    await compile('{{ endcapture }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endcapture"]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endcapture"

      1｜ {{ endcapture }}
       ｜ ^              ^
      "
    `);
  }
});

it('capture', async () => {
  expect(
    await compile('{{ capture x }}{{ endcapture }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.x=await(async(s)=>{return s;})("");return s;})();"`,
  );
  expect(
    await compile('{{ capture x }}a{{ endcapture }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.x=await(async(s)=>{s+="a";return s;})("");return s;})();"`,
  );
  expect(
    await compile('{{ capture x}}{{= y and z }}{{ endcapture }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.x=await(async(s)=>{s+=e(c.y&&c.z);return s;})("");return s;})();"`,
  );
});

it('override', async () => {
  expect(
    await compile(
      '{{ capture x }}foo{{ endcapture }}{{ capture x }}bar{{ endcapture }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";c.x=await(async(s)=>{s+="foo";return s;})("");c.x=await(async(s)=>{s+="bar";return s;})("");return s;})();"`,
  );
});
