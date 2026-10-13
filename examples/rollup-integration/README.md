# Rollup Integration

Pre-compile Janja templates as part of a Rollup build with [`vite-plugin-janja`](../../packages/vite-plugin-janja), which is a plain Rollup plugin.

## Setup

```bash
pnpm add janja
pnpm add -D rollup @rollup/plugin-node-resolve vite-plugin-janja
```

```js
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import janja from 'vite-plugin-janja';

export default {
  input: 'src/index.js',
  output: { dir: 'dist', format: 'es' },
  plugins: [resolve(), janja()],
};
```

## Usage

```js
import render from './templates/page.janja';

document.body.innerHTML = await render({ title: 'Hello' });
```

Each `.janja` file is compiled at build time into a module whose default export is `render(data, options)`. Included templates are inlined, and editing one rebuilds the templates that include it. See the [plugin's README](../../packages/vite-plugin-janja/README.md) for options and TypeScript setup.

`janja` stays a runtime dependency: compiled templates import its small rendering runtime (escaping and filters).
