import { expect, it } from 'vitest';
import { ExpFormatter } from './exp-formatter';
import { ExpParser } from './exp-parser';

function format(template: string) {
  return new ExpFormatter().format(
    new ExpParser().parse(template, {
      start: { line: 1, column: 1 },
      end: { line: 1, column: template.length },
    }),
  );
}

it('empty', () => {
  expect(format('')).toMatchInlineSnapshot(`""""`);
});

it('whitespace', () => {
  expect(
    format(`  a
    +\tb  `),
  ).toMatchInlineSnapshot(`"a + b"`);
});

it('string', () => {
  expect(format("'hello'")).toMatchInlineSnapshot(`""hello""`);
  expect(format('"world"')).toMatchInlineSnapshot(`""world""`);
});

it('number', () => {
  expect(format('123')).toMatchInlineSnapshot(`"123"`);
  expect(format('12.34')).toMatchInlineSnapshot(`"12.34"`);
  expect(format('(12,34)')).toMatchInlineSnapshot(`"(12, 34)"`);
});

it('boolean', () => {
  expect(format('true')).toMatchInlineSnapshot(`"true"`);
  expect(format('false')).toMatchInlineSnapshot(`"false"`);
});

it('null and undefined', () => {
  expect(format('null')).toMatchInlineSnapshot(`"null"`);
  expect(format('undefined')).toMatchInlineSnapshot(`"undefined"`);
});

it('id', () => {
  expect(format('a')).toMatchInlineSnapshot(`"a"`);
  expect(format('a(x)')).toMatchInlineSnapshot(`"a(x)"`);
  expect(format('a(x,y="b")')).toMatchInlineSnapshot(`"a(x, y = "b")"`);
});

it('dot', () => {
  expect(format('.')).toMatchInlineSnapshot(`""""`);
  expect(format('a.b.c')).toMatchInlineSnapshot(`"a.b.c"`);
  expect(format('a.b.c(x,y,z)')).toMatchInlineSnapshot(`"a.b.c(x, y, z)"`);
});

it('not', () => {
  expect(format('not a')).toMatchInlineSnapshot(`"not a"`);
  expect(format('not not a')).toMatchInlineSnapshot(`"not not a"`);
});

it('and', () => {
  expect(format('a and b')).toMatchInlineSnapshot(`"a and b"`);
});

it('or', () => {
  expect(format('a or b')).toMatchInlineSnapshot(`"a or b"`);
});

it('is', () => {
  expect(format('a is b')).toMatchInlineSnapshot(`"a is b"`);
});

it('eq', () => {
  expect(format('a eq b')).toMatchInlineSnapshot(`"a eq b"`);
});

it('ne', () => {
  expect(format('a ne b')).toMatchInlineSnapshot(`"a ne b"`);
});

it('gt', () => {
  expect(format('a gt b')).toMatchInlineSnapshot(`"a gt b"`);
});

it('lt', () => {
  expect(format('a lt b')).toMatchInlineSnapshot(`"a lt b"`);
});

it('ge', () => {
  expect(format('a ge b')).toMatchInlineSnapshot(`"a ge b"`);
});

it('le', () => {
  expect(format('a le b')).toMatchInlineSnapshot(`"a le b"`);
});

it('in', () => {
  expect(format('a in b')).toMatchInlineSnapshot(`"a in b"`);
});

it('ni', () => {
  expect(format('a ni b')).toMatchInlineSnapshot(`"a ni b"`);
});

it('add', () => {
  expect(format('a + b')).toMatchInlineSnapshot(`"a + b"`);
});

it('sub', () => {
  expect(format('a - b')).toMatchInlineSnapshot(`"b"`);
});

it('mul', () => {
  expect(format('a * b')).toMatchInlineSnapshot(`"a * b"`);
});

it('div', () => {
  expect(format('a / b')).toMatchInlineSnapshot(`"a / b"`);
});

it('mod', () => {
  expect(format('a % b')).toMatchInlineSnapshot(`"a % b"`);
});

it('set', () => {
  expect(format('a = b')).toMatchInlineSnapshot(`"a = b"`);
  expect(format('(a, b) = c')).toMatchInlineSnapshot(`"(a, b) = c"`);
});

it('pipe', () => {
  expect(format('a|f')).toMatchInlineSnapshot(`"a | f"`);
  expect(format('a|f|f2')).toMatchInlineSnapshot(`"a | f | f2"`);
  expect(format('a|f(x,"y")')).toMatchInlineSnapshot(`"a | f(x, "y")"`);
  expect(format('a|f(x,"y")|f2(not z,1)')).toMatchInlineSnapshot(
    `"a | f(x, "y") | f2(not z, 1)"`,
  );
});

it('conditional', () => {
  expect(format('"a" if x')).toMatchInlineSnapshot(`""a" if x"`);
  expect(format('"a" if x else "b"')).toMatchInlineSnapshot(
    `""a" if x else "b""`,
  );
});

it('seq', () => {
  expect(format('(1,2,3)')).toMatchInlineSnapshot(`"(1, 2, 3)"`);
  expect(format('(a,b.c,"d")')).toMatchInlineSnapshot(`"(a, b.c, "d")"`);
});

it('combined', () => {
  expect(
    format('user|get("age")gt 18 and user|get("name")eq "John"'),
  ).toMatchInlineSnapshot(
    `"user | get("age") gt 18 and user | get("name") eq "John""`,
  );
  expect(format(' not  a  and not b')).toMatchInlineSnapshot(
    `"not a and not b"`,
  );
  expect(format('a or b and c')).toMatchInlineSnapshot(`"a or b and c"`);
  expect(format('a and b or c')).toMatchInlineSnapshot(`"a and b or c"`);
});

it('real world', () => {
  expect(format('f(a|x,y+b,z and c)')).toMatchInlineSnapshot(
    `"f(a | x, y + b, z and c)"`,
  );
  expect(format('(a,b)=c')).toMatchInlineSnapshot(`"(a, b) = c"`);
  expect(format('(a,b,c)=x|y')).toMatchInlineSnapshot(`"(a, b, c) = x | y"`);
});
