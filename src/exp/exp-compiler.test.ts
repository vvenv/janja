import { expect, it } from 'vitest';
import { ExpCompiler } from './exp-compiler';
import { ExpParser } from './exp-parser';

function compile(template: string) {
  return new ExpCompiler().compile(
    new ExpParser().parse(template, {
      start: { line: 1, column: 1 },
      end: { line: 1, column: template.length },
    }),
    'c',
    'f',
  );
}

it('error', () => {
  expect(() => compile('and')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: No left operand for "AND"]`,
  );
  expect(() => compile('|')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: No left operand for "PIPE"]`,
  );
});

it('empty', () => {
  expect(compile('')).toMatchInlineSnapshot(`""""`);
  expect(compile('"world"')).toMatchInlineSnapshot(`""world""`);
});

it('string', () => {
  expect(compile("'hello'")).toMatchInlineSnapshot(`""hello""`);
  expect(compile('"world"')).toMatchInlineSnapshot(`""world""`);
});

it('number', () => {
  expect(compile('123')).toMatchInlineSnapshot(`"123"`);
  expect(compile('12.34')).toMatchInlineSnapshot(`"12.34"`);
  expect(compile('(12,34)')).toMatchInlineSnapshot(`"12,34"`);
});

it('boolean', () => {
  expect(compile('true')).toMatchInlineSnapshot(`"true"`);
  expect(compile('false')).toMatchInlineSnapshot(`"false"`);
});

it('null and undefined', () => {
  expect(compile('null')).toMatchInlineSnapshot(`"null"`);
  expect(compile('undefined')).toMatchInlineSnapshot(`"undefined"`);
});

it('id', () => {
  expect(compile('a')).toMatchInlineSnapshot(`"c.a"`);
  expect(compile('a(x)')).toMatchInlineSnapshot(`"c.a(c.x)"`);
  expect(compile('a(x,y="b")')).toMatchInlineSnapshot(
    `"c.a(c.x,Object.assign(c,{y:"b"});)"`,
  );
});

it('dot', () => {
  expect(compile('.')).toMatchInlineSnapshot(`""""`);
  expect(compile('a.b.c')).toMatchInlineSnapshot(`"c.a.b.c"`);
  expect(compile('a.b.c(x,y,z)')).toMatchInlineSnapshot(
    `"c.a.b.c(c.x,c.y,c.z)"`,
  );
});

it('not', () => {
  expect(compile('not a')).toMatchInlineSnapshot(`"!c.a"`);
  expect(compile('not not a')).toMatchInlineSnapshot(`"!!c.a"`);
});

it('and', () => {
  expect(compile('a and b')).toMatchInlineSnapshot(`"c.a&&c.b"`);
});

it('or', () => {
  expect(compile('a or b')).toMatchInlineSnapshot(`"c.a||c.b"`);
});

it('is', () => {
  expect(compile('a is b')).toMatchInlineSnapshot(`"(typeof c.a===c.b)"`);
});

it('eq', () => {
  expect(compile('a eq b')).toMatchInlineSnapshot(`"c.a===c.b"`);
});

it('ne', () => {
  expect(compile('a ne b')).toMatchInlineSnapshot(`"c.a!==c.b"`);
});

it('gt', () => {
  expect(compile('a gt b')).toMatchInlineSnapshot(`"c.a>c.b"`);
});

it('lt', () => {
  expect(compile('a lt b')).toMatchInlineSnapshot(`"c.a<c.b"`);
});

it('ge', () => {
  expect(compile('a ge b')).toMatchInlineSnapshot(`"c.a>=c.b"`);
});

it('le', () => {
  expect(compile('a le b')).toMatchInlineSnapshot(`"c.a<=c.b"`);
});

it('in', () => {
  expect(compile('a in b')).toMatchInlineSnapshot(`"c.a in c.b"`);
});

it('ni', () => {
  expect(compile('a ni b')).toMatchInlineSnapshot(`"!c.a in c.b"`);
});

it('add', () => {
  expect(compile('a + b')).toMatchInlineSnapshot(`"c.a+c.b"`);
});

it('sub', () => {
  expect(compile('a - b')).toMatchInlineSnapshot(`"c.b"`);
});

it('mul', () => {
  expect(compile('a * b')).toMatchInlineSnapshot(`"c.a*c.b"`);
});

it('div', () => {
  expect(compile('a / b')).toMatchInlineSnapshot(`"c.a/c.b"`);
});

it('mod', () => {
  expect(compile('a % b')).toMatchInlineSnapshot(`"c.a%c.b"`);
});

it('set', () => {
  expect(compile('a = b')).toMatchInlineSnapshot(`"Object.assign(c,{a:c.b});"`);
  expect(compile('(a, b) = c')).toMatchInlineSnapshot(
    `"Object.assign(c,f.pick.call(c,c.c,["a","b"]));"`,
  );
});

it('pipe', () => {
  expect(compile('a | f')).toMatchInlineSnapshot(`"(await f.f.call(c,c.a))"`);
  expect(compile('a | f | f2')).toMatchInlineSnapshot(
    `"(await f.f2.call(c,(await f.f.call(c,c.a))))"`,
  );
  expect(compile('a | f(x, "y")')).toMatchInlineSnapshot(
    `"(await f.f.call(c,c.a,c.x,"y"))"`,
  );
  expect(compile('a | f(x, "y") | f2(not z, 1)')).toMatchInlineSnapshot(
    `"(await f.f2.call(c,(await f.f.call(c,c.a,c.x,"y")),!c.z,1))"`,
  );
});

it('conditional', () => {
  expect(compile('"a" if x')).toMatchInlineSnapshot(`"(c.x?"a":"")"`);
  expect(compile('"a" if x else "b"')).toMatchInlineSnapshot(`"(c.x?"a":"b")"`);
});

it('whitespace', () => {
  expect(
    compile(`  a
    +\tb  `),
  ).toMatchInlineSnapshot(`"c.a+c.b"`);
});

it('combined', () => {
  expect(
    compile('user | get("age") gt 18 and user | get("name") eq "John"'),
  ).toMatchInlineSnapshot(
    `"(await f.get.call(c,c.user,"age"))>18&&(await f.get.call(c,c.user,"name"))==="John""`,
  );
  expect(compile('not a and not b')).toMatchInlineSnapshot(`"!c.a&&!c.b"`);
  expect(compile('a or b and c')).toMatchInlineSnapshot(`"c.a||c.b&&c.c"`);
  expect(compile('a and b or c')).toMatchInlineSnapshot(`"c.a&&c.b||c.c"`);
});

it('real world', () => {
  expect(compile('f(a|x, y + b, z and c)')).toMatchInlineSnapshot(
    `"c.f((await f.x.call(c,c.a)),c.y+c.b,c.z&&c.c)"`,
  );
  expect(compile('(a, b) = c')).toMatchInlineSnapshot(
    `"Object.assign(c,f.pick.call(c,c.c,["a","b"]));"`,
  );
  expect(compile('(a, b, c) = x | y')).toMatchInlineSnapshot(
    `"Object.assign(c,f.pick.call(c,(await f.y.call(c,c.x)),["a","b","c"]));"`,
  );
});
