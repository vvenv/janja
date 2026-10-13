# vite-plugin-janja

Pre-compile [Janja](https://github.com/vvenv/janja) templates in Vite and Rollup builds. Templates become plain JavaScript modules, so nothing is parsed or compiled in the browser.

```bash
pnpm add janja
pnpm add -D vite-plugin-janja
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import janja from 'vite-plugin-janja';

export default defineConfig({
  plugins: [janja()],
});
```

```js
import render from './templates/page.janja';

document.body.innerHTML = await render({ title: 'Hello' });
```

- `{{ include "partials/footer" }}` is resolved relative to the template (or to the `root` option), with or without the extension, and inlined. Editing an included template rebuilds the templates that use it.
- Source maps point back into the template.
- Template errors fail the build with the offending line.
- `janja` stays a runtime dependency: compiled templates import its small rendering runtime (escaping and filters).

## Options

| Option            | Default        | Description |
| ----------------- | -------------- | ----------- |
| `root`            | template's directory | Directory that include paths are resolved against |
| `extensions`      | `['.janja']`   | File extensions to compile |
| `compilerOptions` |                | Janja compiler options: custom delimiters, plugins, `stripComments`, ... |

## TypeScript

```ts
/// <reference types="vite-plugin-janja/client" />
```

For per-template data types, generate declarations with `janja compile --dts` from `janja-cli`.

## Rollup

The same plugin works in Rollup:

```js
import janja from 'vite-plugin-janja';

export default { input: 'src/index.js', plugins: [janja()] };
```
