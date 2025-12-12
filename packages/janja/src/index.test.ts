import { expect, it } from 'vitest';
import { fileLoader } from '../test/loaders/file-loader';
import { render, renderFile } from './index';

const loader = async (_path: string) =>
  fileLoader(`test/templates/${_path}.janja`);

it('error', async () => {
  expect(
    await render('{{ for name of names }}{{ endfor }}', {}),
  ).toMatchInlineSnapshot(`""`);
  expect(await render('{{ include "not-found" }}', {})).toMatchInlineSnapshot(
    `""`,
  );
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
