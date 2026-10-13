# Webpack Integration

Pre-compile Janja templates as part of a Webpack build with a small loader, [`janja-loader.js`](./janja-loader.js).

## Setup

```bash
pnpm add janja
pnpm add -D webpack webpack-cli
```

```js
// webpack.config.js
const path = require('node:path');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.janja$/,
        use: [
          {
            loader: path.resolve(__dirname, 'janja-loader.js'),
            options: { root: 'src/templates' },
          },
        ],
      },
    ],
  },
};
```

## Usage

```js
import render from './templates/page.janja';

document.body.innerHTML = await render({ title: 'Hello' });
```

The loader compiles each `.janja` file at build time into a module whose default export is `render(data, options)`. Included templates are inlined, and editing one triggers a rebuild of the templates that include it.

`janja` stays a runtime dependency: the compiled module imports the small rendering runtime (escaping and filters) from it.

For TypeScript, declare the module type once:

```ts
declare module '*.janja' {
  const render: (data?: Record<string, unknown>) => Promise<string>;
  export default render;
}
```
