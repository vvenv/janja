import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import oniguruma from 'vscode-oniguruma';
import textmate from 'vscode-textmate';

const require = createRequire(import.meta.url);

async function tokenize(line: string) {
  const wasm = await readFile(
    require.resolve('vscode-oniguruma/release/onig.wasm'),
  );

  await oniguruma.loadWASM(wasm.buffer as ArrayBuffer);

  const registry = new textmate.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
      createOnigString: (text) => new oniguruma.OnigString(text),
    }),
    loadGrammar: async (scopeName) => {
      // The embedded HTML grammar ships with VS Code, not with this package
      if (scopeName !== 'text.html.janja') {
        return null;
      }

      return textmate.parseRawGrammar(
        await readFile(
          new URL('../syntaxes/janja.tmLanguage.json', import.meta.url),
          'utf-8',
        ),
        'janja.json',
      );
    },
  });

  const grammar = await registry.loadGrammar('text.html.janja');

  return grammar!
    .tokenizeLine(line, textmate.INITIAL)
    .tokens.map(({ startIndex, endIndex, scopes }) => [
      line.slice(startIndex, endIndex).trim(),
      scopes.at(-1)!,
    ])
    .filter(([text]) => text);
}

it('highlights output tags', async () => {
  expect(
    await tokenize('<p>{{=- user.name | truncate(10, "…") -}}</p>'),
  ).toEqual([
    ['<p>', 'text.html.janja'],
    ['{{=', 'punctuation.section.embedded.begin.janja'],
    ['-', 'keyword.operator.whitespace.janja'],
    ['user', 'variable.other.janja'],
    ['.', 'punctuation.accessor.janja'],
    ['name', 'variable.other.property.janja'],
    ['|', 'keyword.operator.pipe.janja'],
    ['truncate', 'support.function.filter.janja'],
    ['(', 'meta.embedded.expression.janja'],
    ['10', 'constant.numeric.janja'],
    [',', 'punctuation.separator.janja'],
    ['"', 'string.quoted.double.janja'],
    ['…', 'string.quoted.double.janja'],
    ['"', 'string.quoted.double.janja'],
    [')', 'meta.embedded.expression.janja'],
    ['-', 'keyword.operator.whitespace.janja'],
    ['}}', 'punctuation.section.embedded.end.janja'],
    ['</p>', 'text.html.janja'],
  ]);
});

it('highlights directives, operators and comments', async () => {
  expect(
    await tokenize('{{ if a eq 1 and not fn(b) }}{{# note #}}{{ endif }}'),
  ).toEqual([
    ['{{', 'punctuation.section.embedded.begin.janja'],
    ['if', 'keyword.control.janja'],
    ['a', 'variable.other.janja'],
    ['eq', 'keyword.operator.word.janja'],
    ['1', 'constant.numeric.janja'],
    ['and', 'keyword.operator.word.janja'],
    ['not', 'keyword.operator.word.janja'],
    ['fn', 'entity.name.function.janja'],
    ['(', 'meta.embedded.expression.janja'],
    ['b', 'variable.other.janja'],
    [')', 'meta.embedded.expression.janja'],
    ['}}', 'punctuation.section.embedded.end.janja'],
    ['{{#', 'punctuation.definition.comment.begin.janja'],
    ['note', 'comment.block.janja'],
    ['#}}', 'punctuation.definition.comment.end.janja'],
    ['{{', 'punctuation.section.embedded.begin.janja'],
    ['endif', 'keyword.control.janja'],
    ['}}', 'punctuation.section.embedded.end.janja'],
  ]);
});

it('the manifest points at files that exist', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf-8'),
  );

  for (const { path } of manifest.contributes.grammars) {
    JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf-8'));
  }

  JSON.parse(
    await readFile(
      new URL(
        `../${manifest.contributes.languages[0].configuration}`,
        import.meta.url,
      ),
      'utf-8',
    ),
  );
});
