# Rollup Integration Example

This example demonstrates how to integrate Janja pre-compiled templates with Rollup.

## Setup

1. Install dependencies:
```bash
pnpm add janja
```

2. Create a Rollup plugin for Janja templates:

```javascript
// rollup-plugin-janja.js
import { precompileTemplate } from 'janja';

export default function janjaPlugin() {
  return {
    name: 'janja',
    transform(code, id) {
      if (id.endsWith('.janja')) {
        const compiled = precompileTemplate(code, { includeRuntime: true });
        return {
          code: `export default ${compiled}`,
          map: null,
        };
      }
    },
  };
}
```

3. Add the plugin to your rollup.config.js:

```javascript
import janjaPlugin from './rollup-plugin-janja.js';

export default {
  plugins: [janjaPlugin()],
};
```

4. Import and use templates in your code:

```javascript
import template from './template.janja';

const result = await template({ name: 'World' });
console.log(result);
```

## Pre-compilation Workflow

For production builds, you can pre-compile templates during the build process:

```javascript
// rollup.config.js
import { precompileTemplate } from 'janja';
import fs from 'fs';
import path from 'path';

export default {
  plugins: [
    {
      name: 'janja-precompile',
      buildEnd() {
        const templateDir = path.resolve(process.cwd(), 'src/templates');
        const outputDir = path.resolve(process.cwd(), 'dist/compiled');

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
      },
    },
  ],
};
```

## Using the CLI for Pre-compilation

Alternatively, you can use the Janja CLI to pre-compile templates before the build:

```json
{
  "scripts": {
    "precompile": "janja compile src/templates dist/compiled --runtime",
    "build": "npm run precompile && rollup -c"
  }
}
```

## Benefits

- **Tree-shaking**: Rollup's tree-shaking works perfectly with pre-compiled templates
- **Small bundles**: Only the necessary runtime code is included
- **Multiple formats**: Output can be configured for ESM, CJS, UMD, etc.
- **Code splitting**: Works with Rollup's code splitting features
