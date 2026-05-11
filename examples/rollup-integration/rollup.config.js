// Rollup integration example for Janja pre-compiled templates
// This example shows how to use pre-compiled Janja templates in a Rollup project

import { precompileTemplate } from 'janja';
import fs from 'fs';
import path from 'path';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
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
