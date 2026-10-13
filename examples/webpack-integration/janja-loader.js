const { readFile } = require('node:fs/promises');
const path = require('node:path');

// Turns `import render from './page.janja'` into a pre-compiled template:
// nothing is parsed or compiled in the browser.
module.exports = function janjaLoader(source) {
  const callback = this.async();
  const { root = 'src/templates' } = this.getOptions();
  const base = path.resolve(this.rootContext, root);

  import('janja')
    .then(({ precompileTemplate }) =>
      precompileTemplate(source, {
        // exports `render(data, options)` as the default export
        includeRuntime: true,
        // {{ include "partials/footer" }} -> <root>/partials/footer.janja
        loader: async (name) => {
          const file = path.resolve(base, `${name}.janja`);

          this.addDependency(file);

          return readFile(file, 'utf-8');
        },
      }),
    )
    .then((code) => callback(null, code), callback);
};
