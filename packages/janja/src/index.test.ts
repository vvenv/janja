import { expect, it } from 'vitest';
import { fileLoader } from '../test/loaders/file-loader';
import { render, renderFile } from './index';

const loader = async (_path: string) =>
  fileLoader(`test/templates/${_path}.janja`);

it('error', async () => {
  await expect(
    render('{{= a.b.c }}', {}),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RenderError: Cannot read properties of undefined (reading 'b')]`,
  );
  await expect(
    render('{{ include "not-found" }}', {}, { loader }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Failed to load template from "not-found"]`,
  );
  await expect(
    render('{{ if x }}a', {}),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[CompileError: Unclosed "if"]`);
});

it('custom debug handler reports errors instead of throwing', async () => {
  const errors: string[] = [];
  const debug = (error: Error) => errors.push(error.message);

  expect(await render('a{{= a.b.c }}', {}, { debug })).toBe('');

  // unclosed blocks are closed at the end of the template
  for (const [template, name] of [
    ['{{ if x }}a', 'if'],
    ['{{ for i of items }}{{= i }}', 'for'],
    ['{{ block b }}a', 'block'],
    ['{{ macro m }}a', 'macro'],
    ['{{ capture c }}a', 'capture'],
    ['{{ with x }}a', 'with'],
  ]) {
    await render(template, { x: 1, items: [1] }, { debug });

    expect(errors).toContain(`Unclosed "${name}"`);
  }

  expect(await render('{{ if x }}a', { x: 1 }, { debug })).toBe('a');
  expect(errors.filter((e) => e === 'Unclosed "if"')).toHaveLength(2);
});

it('render', async () => {
  expect(await render('{{= name }}', { name: 'foo' })).toMatchInlineSnapshot(
    `"foo"`,
  );
});

it('renderFile', async () => {
  expect(
    await renderFile('test', { name: 'foo' }, { loader }),
  ).toMatchInlineSnapshot(`"foo"`);
});
