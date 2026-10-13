import { expect, it } from 'vitest';
import { validateTemplate } from './validator';

it('validates a correct template', async () => {
  const result = await validateTemplate(
    'Hello {{= name | upper }}{{ if a }}{{ for i of b }}{{= i }}{{ endfor }}{{ endif }}',
  );

  expect(result).toEqual({ valid: true, errors: [], warnings: [] });
});

it('reports syntax errors with their location', async () => {
  const result = await validateTemplate('line one\n  {{ for }}x{{ endfor }}');

  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatchObject({
    type: 'error',
    message: '"for" requires expression',
    line: 2,
    column: 3,
  });
});

it('includes fix suggestions when there is one', async () => {
  const result = await validateTemplate('{{ endif }}');

  expect(result.errors[0].suggestion).toContain('Check your template syntax');
});

it('reports every error, not just the first', async () => {
  const result = await validateTemplate('{{ if }}{{ nope }}{{ endfor }}');

  expect(result.errors.map(({ message }) => message)).toEqual([
    '"if" requires expression',
    'Unknown "nope"',
    'Unexpected "endfor"',
  ]);
});

it('reports unclosed blocks and broken expressions', async () => {
  expect((await validateTemplate('{{ if x }}a')).errors[0].message).toBe(
    'Unclosed "if"',
  );
  expect((await validateTemplate('{{= (a }}')).valid).toBe(false);
  expect((await validateTemplate('{{= x.constructor }}')).valid).toBe(false);
});

it('warns about unknown filters', async () => {
  const result = await validateTemplate('{{= a | upper | nope(1) }}');

  expect(result.valid).toBe(true);
  expect(result.warnings).toEqual([
    expect.objectContaining({ message: 'Unknown filter "nope"', line: 1 }),
  ]);
});

it('honours custom options', async () => {
  const options = {
    outputOpen: '<%=',
    outputClose: '%>',
    filters: { shout: (v: string) => v.toUpperCase() },
  };

  expect(await validateTemplate('<%= a | shout %>', options)).toMatchObject({
    valid: true,
    warnings: [],
  });
});

it('terminates on arbitrary input', async () => {
  const pieces = [
    '{{',
    '}}',
    '{{=',
    '{{#',
    '#}}',
    ' if ',
    ' for ',
    ' else ',
    ' endif ',
    ' endfor ',
    ' x ',
    ' of ',
    '|',
    '(',
    ')',
    '"',
    '.',
    '=',
    '-',
    ' block ',
    ' endblock ',
    ' macro ',
    ' include ',
    ' set ',
    '\n',
    'text',
  ];

  // deterministic pseudo-random generator, so failures are reproducible
  let seed = 42;

  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;

    return seed / 4294967296;
  };

  for (let i = 0; i < 3000; i++) {
    const template = Array.from(
      { length: 1 + Math.floor(random() * 12) },
      () => pieces[Math.floor(random() * pieces.length)],
    ).join('');

    const result = await validateTemplate(template);

    expect(typeof result.valid, template).toBe('boolean');
  }
}, 20000);
