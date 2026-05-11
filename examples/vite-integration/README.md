# Vite Integration Example

This example demonstrates how to integrate Janja pre-compiled templates with Vite.

## Setup

1. Install dependencies:
```bash
npm install --save-dev janja
```

2. Create a Vite plugin for Janja templates:

```javascript
// vite-plugin-janja.js
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

3. Add the plugin to your vite.config.js:

```javascript
import { defineConfig } from 'vite';
import janjaPlugin from './vite-plugin-janja.js';

export default defineConfig({
  plugins: [janjaPlugin()],
});
```

4. Import and use templates in your code:

```javascript
import template from './template.janja';

const result = await template({ name: 'World' });
console.log(result);
```

## Pre-compilation with Vite

For production builds, you can pre-compile templates during the build process:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { precompileTemplate } from 'janja';
import fs from 'fs';
import path from 'path';

export default defineConfig({
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
});
```

## Benefits

- **Fast HMR**: Vite's hot module replacement works seamlessly with Janja templates
- **Native ESM**: Works with Vite's native ES modules support
- **Optimized builds**: Templates are pre-compiled during production builds
- **TypeScript support**: Can be combined with TypeScript for better type checking
