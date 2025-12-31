import { expect, it } from 'vitest';
import { format } from '../test/__helper';

it('escape tag', () => {
  expect(format('{{= "{\\{ escape }\\}" }}')).toMatchInlineSnapshot(
    `"{{= "{{ escape }}" }}"`,
  );
  expect(format('{{=- "\\{\\{ escape \\}\\}" -}}')).toMatchInlineSnapshot(
    `"{{=- "{{ escape }}" -}}"`,
  );
});

it('empty', () => {
  expect(format('')).toMatchInlineSnapshot(`""`);
});

it('null', () => {
  expect(format('{{= null }}')).toMatchInlineSnapshot(`"{{= null }}"`);
});

it('literal', () => {
  expect(format('{{= "foo" }}')).toMatchInlineSnapshot(`"{{= "foo" }}"`);
  expect(format('{{=  " foo "  }}')).toMatchInlineSnapshot(`"{{= " foo " }}"`);
});

it('html tags', () => {
  expect(format('<foo>foo</foo>')).toMatchInlineSnapshot(`"<foo>foo</foo>"`);
});

it('quotes', () => {
  expect(format('"\'foo\'"')).toMatchInlineSnapshot(`""'foo'""`);
});

it('line break feed', () => {
  expect(format('\nfoo\n')).toMatchInlineSnapshot(`"foo"`);
});

it('filters', () => {
  expect(format('{{=x|f(y,true,"a",1)}}')).toMatchInlineSnapshot(
    `"{{= x | f(y, true, "a", 1) }}"`,
  );
});
