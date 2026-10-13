import { describe, expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('escape tag', async () => {
  expect(await compile('{{= "{{= escape }}" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("{{= escape ");s+="\\" }}";return s;})();"`,
  );
  expect(await compile('{{= "{\\{= escape }\\}" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("{{= escape }}");return s;})();"`,
  );
  expect(await compile('{{= "\\{{= escape \\}}" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("{{= escape ");s+="\\" }}";return s;})();"`,
  );
  expect(await compile('{{= "\\{\\{= escape \\}\\}" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("{{= escape }}");return s;})();"`,
  );
});

it('basic', async () => {
  expect(await compile('{{= x }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);return s;})();"`,
  );
});

it('arithmetic', async () => {
  expect(
    await compile(
      '{{= x + 2 }}{{= x - 2 }}{{= x * 2 }}{{= x / 2 }}{{= x % 2 }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x+2);s+=e(c.x-2);s+=e(c.x*2);s+=e(c.x/2);s+=e(c.x%2);return s;})();"`,
  );
});

describe('literal', () => {
  it('string', async () => {
    expect(await compile('{{= "*" }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("*");return s;})();"`,
    );
    expect(await compile('{{= "**" }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("**");return s;})();"`,
    );
    expect(await compile('{{= "***" }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("***");return s;})();"`,
    );
    expect(await compile('{{= "\\"*" }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e("\\"*");return s;})();"`,
    );
  });

  it('number', async () => {
    expect(await compile('{{= 12 }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(12);return s;})();"`,
    );
    expect(await compile('{{= 12.34 }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(12.34);return s;})();"`,
    );
  });
});

describe('w/ filters', async () => {
  it('basic', async () => {
    expect(await compile('{{= x | upper }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.upper||u_("upper")).call(c,c.x),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
    expect(await compile('{{= "x" | upper }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.upper||u_("upper")).call(c,"x"),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
    expect(await compile("{{= 'x' | upper }}")).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.upper||u_("upper")).call(c,"x"),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
    expect(await compile('{{= `x` | upper }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.upper||u_("upper")).call(c,"x"),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
  });

  it('multiple', async () => {
    expect(await compile('{{= x | upper | lower }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.lower||u_("lower")).call(c,(r_=(f.upper||u_("upper")).call(c,c.x),r_ instanceof Promise?await r_:r_)),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
  });

  it('duo', async () => {
    expect(
      await compile('{{= x | upper }} and {{= x | upper }}'),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.upper||u_("upper")).call(c,c.x),r_ instanceof Promise?await r_:r_));s+=" and ";s+=e((r_=(f.upper||u_("upper")).call(c,c.x),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
  });

  it('safe', async () => {
    expect(await compile('{{= x | safe }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.safe||u_("safe")).call(c,c.x),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
  });

  it('w/ args', async () => {
    expect(await compile('{{= name | split("") }}')).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.split||u_("split")).call(c,c.name,""),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
    expect(
      await compile('{{= "hello, {name}" | t(name="Janja") }}'),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.t||u_("t")).call(c,"hello, {name}",c.name="Janja"),r_ instanceof Promise?await r_:r_));return s;})();"`,
    );
  });
});

it('whitespace control', async () => {
  expect(await compile(' {{= x }} ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=" ";s+=e(c.x);s+=" ";return s;})();"`,
  );
  expect(await compile(' {{=- x -}} ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);return s;})();"`,
  );
  expect(await compile(' {{=- x }} ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);s+=" ";return s;})();"`,
  );
  expect(await compile(' {{= x -}} ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=" ";s+=e(c.x);return s;})();"`,
  );
  expect(await compile(' 	{{= x }}	 ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=" \\t";s+=e(c.x);s+="\\t ";return s;})();"`,
  );
  expect(await compile(' 	{{=- x -}}	 ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);return s;})();"`,
  );
  expect(await compile(' 	{{=- x }}	 ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);s+="\\t ";return s;})();"`,
  );
  expect(await compile(' 	{{= x -}}	 ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=" \\t";s+=e(c.x);return s;})();"`,
  );
  expect(await compile(' \t\r\n{{= x }}\r\n\t ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=" \\t\\r\\n";s+=e(c.x);s+="\\r\\n\\t ";return s;})();"`,
  );
  expect(await compile(' \t\r\n{{=- x -}}\r\n\t ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);return s;})();"`,
  );
  expect(await compile(' \t\r\n{{=- x }}\r\n\t ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.x);s+="\\r\\n\\t ";return s;})();"`,
  );
  expect(await compile(' \t\r\n{{= x -}}\r\n\t ')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=" \\t\\r\\n";s+=e(c.x);return s;})();"`,
  );
});

it('inline if/else', async () => {
  expect(await compile('{{= "x" if level else "y" }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.level?"x":"y");return s;})();"`,
  );
  expect(await compile('{{= "x" if level }}')).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.level?"x":"");return s;})();"`,
  );
  expect(
    await compile('{{= "x" | f if level else y | f(a) }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e(c.level?(r_=(f.f||u_("f")).call(c,"x"),r_ instanceof Promise?await r_:r_):(r_=(f.f||u_("f")).call(c,c.y,c.a),r_ instanceof Promise?await r_:r_));return s;})();"`,
  );
  expect(
    await compile('{{= "md:block" if page | get("toc") }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.get||u_("get")).call(c,c.page,"toc"),r_ instanceof Promise?await r_:r_)?"md:block":"");return s;})();"`,
  );
  expect(
    await compile(
      '{{= "negative" if accounts | length lt 0 else "positive" }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="",r_;const u_=(n)=>{throw new Error('Unknown filter "'+n+'"')};s+=e((r_=(f.length||u_("length")).call(c,c.accounts),r_ instanceof Promise?await r_:r_)<0?"negative":"positive");return s;})();"`,
  );
});
