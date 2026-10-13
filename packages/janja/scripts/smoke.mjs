// Checks that every published entry point loads and renders: the ES module,
// the CommonJS build, and both browser bundles in a context without any
// Node.js globals. Run after `pnpm build`.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dist = (file) => fileURLToPath(new URL(`../dist/${file}`, import.meta.url));

const template = '{{ for n of names }}<{{= n | upper }}>{{ endfor }}';
const data = { names: ['a', '<b>'] };
const expected = '<A><&lt;B&gt;>';

const esm = await import(dist('index.esm.js'));

assert.equal(await esm.render(template, data), expected);

const cjs = createRequire(import.meta.url)(dist('index.cjs'));

assert.equal(await cjs.render(template, data), expected);

for (const file of ['index.js', 'index.min.js']) {
  const context = vm.createContext({});

  vm.runInContext(await readFile(dist(file), 'utf-8'), context);

  assert.equal(typeof context.janja?.render, 'function', `${file} exposes janja`);
  assert.equal(await context.janja.render(template, data), expected, file);
}

console.log('All entry points render correctly');
