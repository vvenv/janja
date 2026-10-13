/* eslint-disable no-template-curly-in-string */
import { expect, it } from 'vitest';
import {
  formatDocument,
  getCompletions,
  getDiagnostics,
  getHover,
} from './service.js';

// `^` marks the cursor
const complete = (marked: string) =>
  getCompletions(marked.replace('^', ''), marked.indexOf('^')).map(
    ({ label }) => label,
  );

it('reports errors and warnings with zero-based ranges', async () => {
  expect(await getDiagnostics('ok {{= a | upper }}')).toEqual([]);

  expect(
    await getDiagnostics('line\n  {{ if }}x{{ endif }}\n{{= a | nope }}'),
  ).toEqual([
    {
      severity: 'error',
      message: '"if" requires expression',
      line: 1,
      column: 2,
      length: 8,
    },
    {
      severity: 'error',
      message: 'Unexpected "endif"',
      line: 1,
      column: 11,
      length: 11,
    },
    {
      severity: 'warning',
      message: 'Unknown filter "nope"',
      line: 2,
      column: 8,
      length: 4,
    },
  ]);
});

it('never fails on unfinished input', async () => {
  for (const text of ['{{', '{{= ', '{{ if', '{{= a |', '{{# x', '}}', '']) {
    expect(Array.isArray(await getDiagnostics(text))).toBe(true);
  }
});

it('completes directives at the start of a tag', () => {
  expect(complete('{{ ^')).toContain('for');
  expect(complete('{{ en^')).toContain('endif');
  expect(complete('a {{= x }} {{- ^')).toContain('include');
  expect(
    getCompletions('{{ ', 3).find(({ label }) => label === 'for')?.snippet,
  ).toBe('for ${1:item} of ${2:items} }}$0{{ endfor');
});

it('completes filters after a pipe', () => {
  expect(complete('{{= name | ^')).toEqual(
    expect.arrayContaining(['upper', 'lower', 'json', 'safe', 'truncate']),
  );
  expect(complete('{{ if a | up^')).toContain('upper');
  expect(complete('{{= name | ^')).not.toContain('for');
});

it('completes keywords inside expressions', () => {
  expect(complete('{{ if a ^')).toEqual(expect.arrayContaining(['and', 'eq']));
  expect(complete('{{= ^')).toContain('not');
  expect(complete('{{= a.^')).toEqual([]);
});

it('offers nothing outside tags or inside comments', () => {
  expect(complete('plain ^')).toEqual([]);
  expect(complete('{{= a }} ^')).toEqual([]);
  expect(complete('{{# note ^')).toEqual([]);
});

it('formats documents', () => {
  expect(formatDocument('<p>{{=a|upper}}</p>')).toBe('<p>{{= a | upper }}</p>');
  expect(formatDocument('<p>{{= a }}</p>')).toBeNull();
  expect(formatDocument('{{= a')).toBeNull();
});

it('documents directives and built-in filters on hover', () => {
  const text = '{{ for x of list }}{{= x | upper | mine }}{{ endfor }} for';

  expect(getHover(text, 4)).toMatchObject({ start: 3, end: 6 });
  expect(getHover(text, 4)?.contents).toContain('{{ for item of items }}');
  expect(getHover(text, text.indexOf('upper') + 2)).toEqual({
    contents: '`upper` — built-in filter',
    start: text.indexOf('upper'),
    end: text.indexOf('upper') + 5,
  });
  // unknown filters, variables and plain text have nothing to show
  expect(getHover(text, text.indexOf('mine') + 1)).toBeNull();
  expect(getHover(text, text.indexOf('list') + 1)).toBeNull();
  expect(getHover(text, text.length - 1)).toBeNull();
});
