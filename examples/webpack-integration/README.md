# Webpack Integration Example

This example demonstrates how to integrate Janja pre-compiled templates with Webpack.

## Setup

1. Install dependencies:
```bash
npm install --save-dev janja
```

2. Create a Webpack loader for Janja templates (or use the example loader below):

```javascript
// janja-webpack-loader.js
const { precompileTemplate } = require('janja');

module.exports = function (source) {
  const compiled = precompileTemplate(source, { includeRuntime: true });
  return `export default ${compiled}`;
};
```

3. Add the loader to your webpack.config.js:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.janja$/,
        use: './janja-webpack-loader.js',
      },
    ],
  },
};
```

4. Import and use templates in your code:

```javascript
import template from './template.janja';

const result = await template({ name: 'World' });
console.log(result);
```

## Pre-compilation Workflow

For production builds, you may want to pre-compile templates during the build process:

```javascript
// webpack.config.js
const { precompileTemplate } = require('janja');
const fs = require('fs');
const path = require('path');

module.exports = {
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.emit.tapAsync('JanjaPrecompile', (compilation, callback) => {
          const templateDir = path.resolve(__dirname, 'src/templates');
          const outputDir = path.resolve(__dirname, 'dist/compiled');

          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          fs.readdirSync(templateDir).forEach((file) => {
            if (file.endsWith('.janja')) {
              const template = fs.readFileSync(path.join(templateDir, file), 'utf-8');
              const compiled = precompileTemplate(template, { includeRuntime: true });
              fs.writeFileSync(path.join(outputDir, file.replace('.janja', '.js')), compiled);
            }
          });

          callback();
        });
      },
    },
  ],
};
```

## Benefits

- **Faster runtime**: Templates are already compiled to JavaScript
- **Smaller bundle size**: No need to include the full Janja compiler in your bundle
- **Type safety**: Can be combined with TypeScript for better type checking
- **Hot reload**: Works with Webpack's hot module replacement
