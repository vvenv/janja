import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rollup } from 'rollup';
import { build } from 'vite';
import { afterEach, beforeEach, expect, it } from 'vitest';
import janja from './index.js';

let dir: string;

beforeEach(async () => {
  // Inside the package, so that the bundle can resolve `janja`
  dir = await mkdtemp(join(process.cwd(), '.test-'));
  await mkdir(join(dir, 'templates', 'partials'), { recursive: true });
  await writeFile(
    join(dir, 'templates', 'page.janja'),
    '<h1>{{= title }}</h1>{{ include "partials/footer" }}',
  );
  await writeFile(
    join(dir, 'templates', 'partials', 'footer.janja'),
    '<footer>{{= year }}</footer>',
  );
  await writeFile(
    join(dir, 'main.js'),
    "import render from './templates/page.janja';\nexport const html = await render({ title: 'A&B', year: 2026 });\n",
  );
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const load = async (file: string) =>
  (await import(/* @vite-ignore */ pathToFileURL(file).href)).html;

it('compiles templates in a Rollup build', async () => {
  const bundle = await rollup({
    input: join(dir, 'main.js'),
    external: ['janja'],
    plugins: [janja()],
  });

  // the included template is watched as well
  expect(bundle.watchFiles).toContain(
    join(dir, 'templates', 'partials', 'footer.janja'),
  );

  const { output } = await bundle.write({
    dir: join(dir, 'dist'),
    format: 'es',
    sourcemap: true,
  });

  expect(output[0].map?.sources.some((s) => s.endsWith('page.janja'))).toBe(
    true,
  );
  // no template syntax is left to parse at runtime
  expect(output[0].code).not.toContain('{{=');
  expect(await load(join(dir, 'dist', 'main.js'))).toBe(
    '<h1>A&amp;B</h1><footer>2026</footer>',
  );
});

it('compiles templates in a Vite build', async () => {
  await build({
    root: dir,
    logLevel: 'silent',
    configFile: false,
    plugins: [janja()],
    build: {
      outDir: 'dist',
      target: 'esnext',
      minify: false,
      lib: { entry: join(dir, 'main.js'), formats: ['es'], fileName: 'main' },
      rollupOptions: { external: ['janja'] },
    },
  });

  expect(await load(join(dir, 'dist', 'main.js'))).toBe(
    '<h1>A&amp;B</h1><footer>2026</footer>',
  );
});

it('supports a root directory, other extensions and compiler options', async () => {
  await writeFile(
    join(dir, 'templates', 'a.html'),
    '<%= x %>{{ include "partials/b" }}',
  );
  await writeFile(join(dir, 'templates', 'partials', 'b.html'), '[<%= x %>]');
  await writeFile(
    join(dir, 'main.js'),
    "import render from './templates/a.html';\nexport const html = await render({ x: 1 });\n",
  );

  const bundle = await rollup({
    input: join(dir, 'main.js'),
    external: ['janja'],
    plugins: [
      janja({
        root: join(dir, 'templates'),
        extensions: ['.html'],
        compilerOptions: { outputOpen: '<%=', outputClose: '%>' },
      }),
    ],
  });

  await bundle.write({ dir: join(dir, 'dist'), format: 'es' });

  expect(await load(join(dir, 'dist', 'main.js'))).toBe('1[1]');
});

it('fails the build on template errors', async () => {
  await writeFile(join(dir, 'templates', 'page.janja'), '{{ if x }}oops');

  await expect(
    rollup({
      input: join(dir, 'main.js'),
      external: ['janja'],
      plugins: [janja()],
    }),
  ).rejects.toThrow('Unclosed "if"');
});
