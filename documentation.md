# Documentation

The language itself is defined in the [specification](./SPEC.md); this document covers the API and tooling.

## Error Handling

### Errors Throw by Default

`render()` rejects with a `CompileError` when the template is malformed and with a `RenderError` when it fails while running. Both carry a `details` property with the offending source line highlighted:

```typescript
import { render, CompileError } from 'janja';

try {
  await render('{{ for }}', {});
} catch (error) {
  if (error instanceof CompileError) {
    console.log(error.details);
    // "for" requires expression
    //
    // 1│ {{ for }}
    //  │ ^       ^
  }
}
```

### Lenient Mode

To keep rendering instead, pass a `debug` handler. Every error is handed to it, malformed directives are skipped, unclosed blocks are closed at the end of the template, and a template that fails while running renders as an empty string:

```typescript
const html = await render(template, data, {
  debug: (error) => logger.warn(error.details ?? error.message),
});
```

### Missing Values

`null` and `undefined` render as an empty string, and looping over them runs the `else` branch of the loop. Reading a property of a missing value (`{{= user.name }}` without `user`) is an error.

### Template Validation

`validateTemplate()` runs a template through the real parser without rendering it, and reports every syntax error with its position, plus warnings for filters that are not registered:

```typescript
import { validateTemplate } from 'janja';

const result = await validateTemplate('Hello {{= name | uper }}{{ endif }}');

result.valid; // false
result.errors; // [{ type: 'error', message: 'Unexpected "endif"', line: 1, column: 25, suggestion: '...' }]
result.warnings; // [{ type: 'warning', message: 'Unknown filter "uper"', line: 1, column: 15 }]
```

Pass the same options as the renderer (custom delimiters, filters, plugins) as the second argument.

### Common Error Messages

- **`"if" requires expression`**: a directive that needs an expression has none
- **`Unclosed "if"`**: a block directive is missing its `endif` / `endfor` / `endblock` / ...
- **`Unexpected "endif"`**: a closing or branch directive has no matching opening directive
- **`Unknown "name"`**: `{{ name }}` is not a directive; use `{{= name }}` to output a value
- **`"constructor" is not allowed in expressions`**: see [Security](./SECURITY.md)

## Built-in Directives

### **include**: Template Inheritance & Inclusion

```janja
{{ include "template" }}
```

### **if / elif / else**: Conditional Statements

```janja
{{ if condition }}Content{{ elif other }}Content{{ else }}Content{{ endif }}
```

### **for**: Looping

```janja
{{ for item of array_items }}{{= item }}{{ endfor }}
```

```janja
{{ for item of object_items | values }}{{= item }}{{ endfor }}
```

### **set**: Variable Assignment

```janja
{{ set foo = 123 }}
{{ set (a, b) = obj }}
```

### **capture**: Capture Rendered Content

```janja
{{ capture foo }}Content{{ endcapture }}
{{= foo }}
```

### **with**: Scoped Context

```janja
{{ with user }}{{= name }}{{ endwith }}
```

### **block / super**: Block Overriding & Inheritance

Blocks with the same name will automatically overwrite or inherit, and blocks are always rendered where they first appear.

```janja
{{ block title }}{{ super }}Default Title{{ endblock }}
```

### **macro / caller**: Macro Definition & Invocation

```janja
{{ macro my_macro(x, y) }}Content{{ caller }}{{ endmacro }}
```

### **call**: Macro Invocation

```janja
{{ call my_macro("foo", "bar") }}Content{{ endcall }}
```

### **break / continue**: Loop Control

```janja
{{ break }}
{{ continue }}
```

### **comment**: Comments

```janja
{{# This is a comment #}}
```

### **expression (=)**: Expression Output

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, ceil, compact, div, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, mul, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, trim, truncate, unique, upper, urldecode, urlencode, values

### Date/Time Filters

- **date**: Format dates
- **timeAgo**: Display relative time

### Number Formatting Filters

- **round**: Round numbers
- **fixed**: Format numbers with fixed decimal places
- **percent**: Format numbers as percentages
- **currency**: Format numbers as currency

### Text Processing Filters

- **wordCount**: Count words in text
- **stripTags**: Remove HTML tags
- **slugify**: Convert text to URL-friendly slugs

### Array Manipulation Filters

- **shuffle**: Randomly shuffle array elements
- **chunk**: Split array into chunks
- **pluck**: Extract property values from array of objects

### Object Transformation Filters

- **defaults**: Set default values for missing properties
- **invert**: Invert object keys and values
- **merge**: Merge multiple objects

### Async Filters

- **fetchUrl**: Fetch data from a URL (async)
- **delay**: Add delay (async)

### Examples

```janja
{{= foo | upper }}
{{= list | join(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## CLI Tool

`janja-cli` compiles templates ahead of time into ES modules, so nothing is parsed or compiled when your application runs.

### Installation

```bash
pnpm add -D janja-cli
```

### Compile Command

```bash
# a single file
janja compile template.janja ./compiled

# every .janja and .html file of a directory
janja compile ./templates ./compiled --recursive
```

Options:
- `-r, --recursive`: Also compile templates in subdirectories (the directory layout is kept)
- `--runtime`: Also export a ready-to-call `render(data, options)` function
- `--source-map`: Write a source map next to each compiled module
- `--dts`: Write TypeScript declarations for each compiled module

`{{ include "partials/footer" }}` is resolved relative to the input directory, with or without the file extension, and is inlined into the compiled module. Compilation fails with a non-zero exit code when a template has errors.

### Watch Command

Compiles once, then recompiles whenever a template is added, changed or removed:

```bash
janja watch ./templates ./compiled --recursive
```

### Check Command

Validate templates without compiling them, for example in CI. Prints `file:line:column` for every problem and exits with a non-zero status when there are errors:

```bash
janja check ./templates --recursive
janja check ./templates --recursive --strict   # unknown filters fail too
```

### Format Command

Normalise the spacing inside tags (`{{=name|upper}}` becomes `{{= name | upper }}`). Text between tags is never touched, and a tag that cannot be parsed is left as written:

```bash
janja format ./templates --recursive
janja format ./templates --recursive --check   # report only, for CI
```

### Using Compiled Templates

```typescript
import { renderCompiled } from 'janja';
import { script } from './compiled/page.js';

const html = await renderCompiled(script, { title: 'Hello' });
```

With `--runtime` the module's default export does this for you:

```typescript
import render from './compiled/page.js';

const html = await render({ title: 'Hello' });
```

## API Reference

### render()

Render a template string with data:

```typescript
import { render } from 'janja';

const result = await render('Hello {{= name }}!', { name: 'World' });
// "Hello World!"
```

### renderFile()

Render a template loaded through the `loader` option:

```typescript
import { readFile } from 'node:fs/promises';
import { renderFile } from 'janja';

const options = { loader: (path) => readFile(`./templates/${path}.janja`, 'utf-8') };

const result = await renderFile('page', { name: 'World' }, options);
```

The same loader resolves `{{ include "..." }}`. Without a loader, included templates are empty.

### Renderer

`render()` and `renderFile()` reuse a renderer per options object, so pass the same object on every call to benefit from the compile cache, or create the renderer yourself:

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  // values available to every template
  globals: { siteName: 'My Site' },
  // HTML-escape output (default: true)
  autoEscape: true,
  // load templates for renderFile() and include
  loader: async (path) => '...',
  // receive errors instead of throwing them
  debug: (error) => console.warn(error),
  cache: {
    enabled: true, // default
    maxSize: 1000, // compiled templates to keep (default)
    ttl: 3600000, // milliseconds (default: 1 hour), 0 to never expire
    revalidate: true, // re-read included templates on every cache hit (default)
  },
});

await renderer.render('Hello {{= name }} from {{= siteName }}!', { name: 'World' });
```

Cache management: `renderer.clearCache()`, `renderer.invalidateCache(predicate?)`, `renderer.getCacheStats()`.

### precompileTemplate() / renderCompiled()

```typescript
import { precompileTemplate, renderCompiled } from 'janja';

// build time: returns the source of an ES module exporting `script`
const moduleSource = await precompileTemplate('Hello {{= name }}!', { loader });

// run time
import { script } from './hello.js';

await renderCompiled(script, { name: 'World' });
```

### validateTemplate()

```typescript
import { validateTemplate } from 'janja';

const { valid, errors, warnings } = await validateTemplate('Hello {{= name }}');
```

### renderStream()

Render to a [`ReadableStream`](https://developer.mozilla.org/docs/Web/API/ReadableStream) of strings, so the start of a page can be sent while the rest is still rendering:

```typescript
import { renderStream } from 'janja';

const stream = renderStream(template, data);

// Node.js
for await (const chunk of stream) {
  response.write(chunk);
}

// Fetch API / edge runtimes
return new Response(stream.pipeThrough(new TextEncoderStream()));
```

Output is written between the top-level parts of a template and between the iterations of top-level loops (including loops inside a top-level `if`), in chunks of about 1,000 characters. Content inside `capture`, `macro`, `block` and included templates is produced as a whole. The stream respects backpressure, and cancelling it stops rendering. Errors reject the stream; in lenient mode they go to `debug` and the stream ends.

### Typed templates

```typescript
import { defineFilters, Renderer } from 'janja';

const renderer = new Renderer({
  // argument types are checked where the filter is defined
  filters: defineFilters({
    shout: (value: string, times = 1) => value.toUpperCase() + '!'.repeat(times),
  }),
});

// bind a template to the data it expects
const page = renderer.template<{ title: string; items?: string[] }>(source);

await page({ title: 'Hello' });
```

For pre-compiled templates, `janja compile --dts` writes a declaration file per template with a `TemplateData` interface listing the data the template reads.

### analyzeTemplate()

Statically determine what a template needs. Included templates are followed through the `loader`:

```typescript
import { analyzeTemplate } from 'janja';

await analyzeTemplate('{{ for item of items }}{{= item.name | upper }}{{ endfor }}{{= title }}');
// {
//   variables: ['items', 'title'],
//   filters: ['upper'],
//   includes: [], blocks: [], macros: [],
// }
```

### formatTemplate()

```typescript
import { formatTemplate } from 'janja';

formatTemplate('<p>{{=name|upper}}</p>{{if a  eq 1}}x{{endif}}');
// '<p>{{= name | upper }}</p>{{ if a eq 1 }}x{{ endif }}'
```

Only the inside of tags changes; text, whitespace-control markers and multi-line comments are kept as they are. A tag is only rewritten when the result provably parses to the same expression.

### createFileLoader()

A ready-made `loader` for Node.js that reads templates from a directory, with or without extension, and refuses paths that lead outside of it:

```typescript
import { createFileLoader, Renderer } from 'janja';

const renderer = new Renderer({ loader: createFileLoader('./templates') });

await renderer.renderFile('pages/home', data);
```

### Source maps

`precompile()` returns the module together with a standard (version 3) source map pointing back into the template:

```typescript
import { precompile } from 'janja';

const { code, map, dts } = await precompile(template, {
  sourceMap: true,
  filename: 'page.janja',
  dts: true,
});
```

`janja compile --source-map` and `vite-plugin-janja` use this, so stack traces and debuggers show template lines.

## Customization

### Custom Directive

```typescript
import { render, Traversal, type Loc } from 'janja';

class CustomNode extends Traversal {
  readonly type = 'CUSTOM';

  constructor(public readonly loc: Loc) {
    super();
  }
}

await render('{{ custom }}', {}, {
  parsers: {
    *custom(token) {
      yield 'NEXT';
      yield new CustomNode(token.loc);
    },
  },
  compilers: {
    CUSTOM: (node, compiler) => {
      compiler.pushStr(node.loc, '<CUSTOM/>');
    },
  },
});
// "<CUSTOM/>"
```

### Custom Filter

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  filters: {
    my_filter(value) {
      return `Custom: ${value}`;
    },
  },
});

await renderer.render('{{= foo | my_filter }}', { foo: 'bar' });
// "Custom: bar"
```

Filters may be `async`.

---

## Best Practices

### 1. Validate Templates in CI

```typescript
import { readFile } from 'node:fs/promises';
import { validateTemplate } from 'janja';

for (const file of templateFiles) {
  const { valid, errors } = await validateTemplate(await readFile(file, 'utf-8'));

  if (!valid) {
    console.error(file, errors);
    process.exitCode = 1;
  }
}
```

### 2. Reuse One Renderer

The compile cache lives on the `Renderer`. Create one at startup and reuse it rather than building new options on every request. If your templates never change while the process runs, set `cache.revalidate: false` to skip re-reading included templates.

### 3. Pre-compile for Production

```bash
janja compile ./templates ./dist/templates --recursive
```

### 4. Keep Auto-Escaping On

Leave `autoEscape` enabled and mark trusted HTML explicitly with the `safe` filter or `new Safe(html)`. Read [SECURITY.md](./SECURITY.md) before rendering templates written by people you do not trust.

### 5. Decide How Errors Surface

Let errors throw in development and tests. In production either catch them around `render()`, or pass a `debug` handler that reports to your error tracker and lets the page render without the broken part.

### 6. Organize Templates with Blocks

```janja
{{# base.janja #}}
<html>
<head>
  {{ block head }}<title>Default Title</title>{{ endblock }}
</head>
<body>
  {{ block content }}Default content{{ endblock }}
</body>
</html>
```

```janja
{{# page.janja #}}
{{ include "base" }}
{{ block head }}<title>My Page</title>{{ endblock }}
{{ block content }}<h1>My Content</h1>{{ endblock }}
```

## Troubleshooting

### `Unknown "name"`

`{{ name }}` is a directive. Use `{{= name }}` to output a value.

### A Variable Renders as Nothing

`null` and `undefined` render as an empty string. Check the spelling (names are case-sensitive) and that the value is in the data you pass, or give it a default: `{{= name | fallback("Anonymous") }}`.

### An Included Template Is Empty

`include` needs the `loader` option; the default loader returns an empty template.

### Rendering Is Slow

- Reuse one `Renderer` (or one options object) so compiled templates are cached
- Pre-compile templates for production
- Run `pnpm bench` in `packages/janja` to compare against other engines on your machine

### Security Concerns

See [SECURITY.md](./SECURITY.md).

## Ecosystem

| Package | Purpose |
| ------- | ------- |
| [`janja-cli`](./packages/janja-cli) | Pre-compile, watch and check templates from the command line |
| [`vite-plugin-janja`](./packages/vite-plugin-janja) | Import templates in Vite and Rollup builds |
| [`janja-express`](./packages/janja-express) | View engine for Express |
| [`janja-koa`](./packages/janja-koa) | `ctx.render()` for Koa |
| [`janja-fastify`](./packages/janja-fastify) | `reply.view()` for Fastify |
| [`janja-language-server`](./packages/janja-language-server) | Diagnostics, completions, hover and formatting for any LSP editor |
| [`eslint-plugin-janja`](./packages/eslint-plugin-janja) | Formatting rules for templates |
| [`vscode-janja`](./packages/vscode-janja) | Highlighting and the language server's features in VS Code |
