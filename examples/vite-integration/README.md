# Vite Integration

Pre-compile Janja templates in Vite, in development and in production builds, with [`vite-plugin-janja`](../../packages/vite-plugin-janja).

## Setup

```bash
pnpm add janja
pnpm add -D vite vite-plugin-janja
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import janja from 'vite-plugin-janja';

export default defineConfig({
  plugins: [janja()],
});
```

## Usage

```js
import render from './templates/page.janja';

document.body.innerHTML = await render({ title: 'Hello' });
```

Each `.janja` file is compiled at build time into a module whose default export is `render(data, options)`. Included templates are inlined, and editing one rebuilds the templates that include it. See the [plugin's README](../../packages/vite-plugin-janja/README.md) for options and TypeScript setup.

`janja` stays a runtime dependency: compiled templates import its small rendering runtime (escaping and filters).
