// Vite integration example for Janja pre-compiled templates
// This example shows how to use pre-compiled Janja templates in a Vite project

import { defineConfig } from 'vite';
import { precompileTemplate } from 'janja';

export default defineConfig({
  plugins: [
    {
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
    },
  ],
});
