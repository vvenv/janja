import { expect, it } from 'vitest'
import { ExpCompiler } from './exp-compiler'
import { ExpParser } from './exp-parser'

function compile(template: string) {
  return new ExpCompiler().compile(new ExpParser().parse(template), 'c', 'f')
}

it('invalid', () => {
  expect(() => compile('and')).toThrowErrorMatchingInlineSnapshot(`[ParseError: no left operand for "AND"]`)
  expect(() => compile('|')).toThrowErrorMatchingInlineSnapshot(`[ParseError: no left operand for "PIPE"]`)
})

it('empty', () => {
  expect(compile('')).toMatchInlineSnapshot(
    `""""`,
  )
  expect(compile('"world"')).toMatchInlineSnapshot(
    `""world""`,
  )
})

it('string', () => {
  expect(compile('\'hello\'')).toMatchInlineSnapshot(
    `""hello""`,
  )
  expect(compile('"world"')).toMatchInlineSnapshot(
    `""world""`,
  )
})

it('number', () => {
  expect(compile('123')).toMatchInlineSnapshot(
    `"123"`,
  )
  expect(compile('12.34')).toMatchInlineSnapshot(
    `"12.34"`,
  )
  expect(compile('(12,34)')).toMatchInlineSnapshot(
    `"12,34"`,
  )
})

it('boolean', () => {
  expect(compile('true')).toMatchInlineSnapshot(
    `"true"`,
  )
  expect(compile('false')).toMatchInlineSnapshot(
    `"false"`,
  )
})

it('id', () => {
  expect(compile('a')).toMatchInlineSnapshot(
    `"c.a"`,
  )
  expect(compile('a(x)')).toMatchInlineSnapshot(
    `"c.a(c.x)"`,
  )
  expect(compile('a(x,y="b")')).toMatchInlineSnapshot(
    `"c.a(c.x,Object.assign(c,{y:"b"});)"`,
  )
})

it('dot', () => {
  expect(compile('.')).toMatchInlineSnapshot(
    `""""`,
  )
  expect(compile('a.b.c')).toMatchInlineSnapshot(
    `"c.a.b.c"`,
  )
  expect(compile('a.b.c(x, y, z)')).toMatchInlineSnapshot(
    `"c.a.b.c(c.x,c.y,c.z)"`,
  )
})

it('not', () => {
  expect(compile('not a')).toMatchInlineSnapshot(
    `"!c.a"`,
  )
  expect(compile('not not a')).toMatchInlineSnapshot(
    `"!!c.a"`,
  )
})

it('and', () => {
  expect(compile('a and b')).toMatchInlineSnapshot(
    `"(c.a&&c.b)"`,
  )
})

it('or', () => {
  expect(compile('a or b')).toMatchInlineSnapshot(
    `"(c.a||c.b)"`,
  )
})

it('of', () => {
  expect(compile('a of b')).toMatchInlineSnapshot(
    `"const a of c.b"`,
  )
  expect(compile('(x,y) of b')).toMatchInlineSnapshot(
    `"const {x,y} of c.b"`,
  )
})

it('eq', () => {
  expect(compile('a eq b')).toMatchInlineSnapshot(
    `"(c.a===c.b)"`,
  )
})

it('ne', () => {
  expect(compile('a ne b')).toMatchInlineSnapshot(
    `"(c.a!==c.b)"`,
  )
})

it('gt', () => {
  expect(compile('a gt b')).toMatchInlineSnapshot(
    `"(c.a>c.b)"`,
  )
})

it('lt', () => {
  expect(compile('a lt b')).toMatchInlineSnapshot(
    `"(c.a<c.b)"`,
  )
})

it('ge', () => {
  expect(compile('a ge b')).toMatchInlineSnapshot(
    `"(c.a>=c.b)"`,
  )
})

it('le', () => {
  expect(compile('a le b')).toMatchInlineSnapshot(
    `"(c.a<=c.b)"`,
  )
})

it('in', () => {
  expect(compile('a in b')).toMatchInlineSnapshot(
    `"(c.a in c.b)"`,
  )
})

it('ni', () => {
  expect(compile('a ni b')).toMatchInlineSnapshot(
    `"(!(c.a in c.b))"`,
  )
})

it('add', () => {
  expect(compile('a + b')).toMatchInlineSnapshot(
    `"(c.a+c.b)"`,
  )
})

it('sub', () => {
  expect(compile('a - b')).toMatchInlineSnapshot(
    `"c.b"`,
  )
})

it('mul', () => {
  expect(compile('a * b')).toMatchInlineSnapshot(
    `"(c.a*c.b)"`,
  )
})

it('div', () => {
  expect(compile('a / b')).toMatchInlineSnapshot(
    `"(c.a/c.b)"`,
  )
})

it('mod', () => {
  expect(compile('a % b')).toMatchInlineSnapshot(
    `"(c.a%c.b)"`,
  )
})

it('set', () => {
  expect(compile('a = b')).toMatchInlineSnapshot(
    `"Object.assign(c,{a:c.b});"`,
  )
  expect(compile('(x, y) = z')).toMatchInlineSnapshot(
    `"Object.assign(c,f.pick.call(c,c.z,["x","y"]));"`,
  )
})

it('set - macros', () => {
  expect(compile('a = (x, y)')).toMatchInlineSnapshot(
    `"c.a=(x,y)"`,
  )
  expect(compile('a = (x=true, y=x, z="b")')).toMatchInlineSnapshot(
    `"c.a=(x=true,y=c.x,z="b")"`,
  )
})

it('pipe', () => {
  expect(compile('x | f')).toMatchInlineSnapshot(
    `"(await f.f.call(c,c.x))"`,
  )
  expect(compile('x | f | f2')).toMatchInlineSnapshot(
    `"(await f.f2.call(c,(await f.f.call(c,c.x))))"`,
  )
  expect(compile('x | f(a, "b")')).toMatchInlineSnapshot(
    `"(await f.f.call(c,c.x,c.a,"b"))"`,
  )
  expect(compile('x | f(a, "b") | f2(not c, 1)')).toMatchInlineSnapshot(
    `"(await f.f2.call(c,(await f.f.call(c,c.x,c.a,"b")),!c.c,1))"`,
  )
})

it('conditional', () => {
  expect(compile('"a" if x')).toMatchInlineSnapshot(
    `"(c.x?"a":"")"`,
  )
  expect(compile('"a" if x else "y"')).toMatchInlineSnapshot(
    `"(c.x?"a":"y")"`,
  )
})

it('whitespace', () => {
  expect(compile(`  x
    +\ty  `)).toMatchInlineSnapshot(
    `"(c.x+c.y)"`,
  )
})

it('combined', () => {
  expect(compile('user | get("age") gt 18 and user | get("name") eq "John"')).toMatchInlineSnapshot(
    `"(((await f.get.call(c,c.user,"age"))>18)&&((await f.get.call(c,c.user,"name"))==="John"))"`,
  )
  expect(compile('not x and not y')).toMatchInlineSnapshot(
    `"(!c.x&&!c.y)"`,
  )
  expect(compile('x or b and c')).toMatchInlineSnapshot(
    `"(c.x||(c.b&&c.c))"`,
  )
  expect(compile('x and b or c')).toMatchInlineSnapshot(
    `"((c.x&&c.b)||c.c)"`,
  )
})

it('real world', () => {
  expect(compile('f(x|a, y + b, z and c)')).toMatchInlineSnapshot(
    `"c.f((await f.a.call(c,c.x)),(c.y+c.b),(c.z&&c.c))"`,
  )
  expect(compile('(x, y) = z')).toMatchInlineSnapshot(
    `"Object.assign(c,f.pick.call(c,c.z,["x","y"]));"`,
  )
  expect(compile('(x, y, z) = a | b')).toMatchInlineSnapshot(
    `"Object.assign(c,f.pick.call(c,(await f.b.call(c,c.a)),["x","y","z"]));"`,
  )
  expect(compile('(x, y) of items | f(a, "b")')).toMatchInlineSnapshot(
    `"const {x,y} of (await f.f.call(c,c.items,c.a,"b"))"`,
  )
})
