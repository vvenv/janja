import { expect, it } from 'vitest';
import { compile } from '../test/__helper';

it('error', async () => {
  try {
    await compile('{{ if }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "if" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      ""if" requires expression

      1｜ {{ if }}
       ｜ ^      ^
      "
    `,
    );
  }

  try {
    await compile('{{ endif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endif"]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unexpected "endif"

      1｜ {{ endif }}
       ｜ ^         ^
      "
    `,
    );
  }

  try {
    await compile('{{ x }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unknown "x"]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unknown "x"

      1｜ {{ x }}
       ｜ ^     ^
      "
    `,
    );
  }
});

it('escape tag', async () => {
  expect(await compile('{{= "{\\{ escape }\\}" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e("{{ escape }}");return s;})();"`,
  );
  expect(await compile('{{= "\\{\\{ escape \\}\\}" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e("{{ escape }}");return s;})();"`,
  );
});

it('empty', async () => {
  expect(await compile('')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";return s;})();"`,
  );
});

it('null', async () => {
  expect(await compile('{{= null }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(null);return s;})();"`,
  );
});

it('html tags', async () => {
  expect(await compile('<foo>foo</foo>')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="<foo>foo</foo>";return s;})();"`,
  );
});

it('quotes', async () => {
  expect(await compile('"\'foo\'"')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="\\"'foo'\\"";return s;})();"`,
  );
});

it('line break feed', async () => {
  expect(await compile('\nfoo\n')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="\\nfoo\\n";return s;})();"`,
  );
});

it('filters', async () => {
  expect(await compile('{{= x | f(y, true, "a", 1) }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e((await f.f.call(c,c.x,c.y,true,"a",1)));return s;})();"`,
  );
});
