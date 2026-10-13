# janja-cli

Pre-compile [Janja](https://github.com/vvenv/janja) templates into ES modules, so nothing is parsed or compiled when your application runs.

```bash
pnpm add -D janja-cli
pnpm add janja
```

```bash
# every .janja and .html file of a directory
janja compile ./templates ./compiled --recursive

# recompile on change
janja watch ./templates ./compiled --recursive
```

```bash
# validate templates in CI
janja check ./templates --recursive

# normalise the spacing inside tags (--check to only report)
janja format ./templates --recursive
```

```js
import { renderCompiled } from 'janja';
import { script } from './compiled/page.js';

const html = await renderCompiled(script, { title: 'Hello' });
```

Options:

- `-r, --recursive`: also compile templates in subdirectories (the directory layout is kept)
- `--runtime`: also export a ready-to-call `render(data, options)` function as the default export
- `--source-map`: write a source map next to each compiled module
- `--dts`: write TypeScript declarations for each compiled module

`{{ include "partials/footer" }}` is resolved relative to the input directory, with or without the file extension, and inlined into the compiled module. The command exits with a non-zero status when a template has errors.
