# Getting Started

Janja turns a template and some data into text. Templates compile to JavaScript functions, so the engine runs wherever JavaScript does: Node.js 18 or later, browsers, and edge runtimes. It has no dependencies.

## Installation

<ReleaseNotice />

::: code-group

```bash [npm]
npm install janja
```

```bash [pnpm]
pnpm add janja
```

```bash [yarn]
yarn add janja
```

:::

## Render a Template

```typescript
import { render } from 'janja';

const html = await render('Hello, {{= name }}!', { name: 'World' });
// "Hello, World!"
```

`render()` always returns a promise, because filters and template loading may be asynchronous.

There are three kinds of tags. `{{= expression }}` writes a value, `{{ directive }}` controls what is rendered, and `{{# text #}}` is a comment:

```janja live
{{# greet everyone on the list #}}
{{ for name of names }}
  Hello, {{= name | capitalize }}!
{{ endfor }}
---
{ "names": ["ada", "grace"] }
```

The [template tour](./templates) walks through the language with examples you can edit, and the [playground](/playground) is a good place to experiment.

## Render Files

Templates usually live in files and include one another. Tell the renderer how to load them, and create it once so compiled templates are cached:

```typescript
import { createFileLoader, Renderer } from 'janja';

const renderer = new Renderer({
  loader: createFileLoader('./templates'),
});

// renders ./templates/pages/home.janja
const html = await renderer.renderFile('pages/home', { title: 'Home' });
```

The same loader resolves `{{ include "partials/header" }}`. A loader is just a function from a path to the template source, so templates can come from anywhere:

```typescript
const renderer = new Renderer({
  loader: (path) => fetch(`/templates/${path}.html`).then((res) => res.text()),
});
```

## In the Browser

With a bundler, import `janja` as above. Without one, load the module from a CDN:

```html
<script type="module">
  import { render } from 'https://esm.sh/janja';

  document.body.innerHTML = await render('Hello, {{= name }}!', {
    name: 'World',
  });
</script>
```

Compiling a template in the browser uses `new Function`, which a strict Content Security Policy forbids. [Pre-compile](./cli) your templates in that case.

## With a Web Framework

There are ready-made integrations for [Express, Koa and Fastify](./ecosystem), and a [Vite plugin](./ecosystem) that compiles templates at build time.

## Next Steps

- [Template tour](./templates): the language, by example
- [Error handling](./errors): what happens when a template is wrong
- [API](./api): rendering, streaming, pre-compiling and typed templates
- [Language specification](/reference/spec): the precise rules
