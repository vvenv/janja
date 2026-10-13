# Janja

<p align="center">A simple, fast, lightweight, and extensible template engine for Node.js and browsers.</p>

<p align="center">
  <a href="https://github.com/vvenv/janja/actions/workflows/test.yml"><img src="https://github.com/vvenv/janja/actions/workflows/test.yml/badge.svg" alt="test"></a>
</p>

<p align="center">
  <a href="./README-zh-CN.md">中文</a>
</p>

## Key Features

- 📝 **Intuitive template syntax**: Simple syntax for variables, conditionals, and loops.
- 🔄 **Layout and partials**: Supports template inheritance and reusable components.
- 🛠️ **Built-in directives and filters**: A collection of built-in directives and filters.
- 🎨 **Custom directives and filters**: Ability to define custom directives and filters.
- 🚀 **Fast**: Templates compile to JavaScript functions, cached per renderer or pre-compiled at build time. See the [benchmarks](./PERFORMANCE.md#benchmarks).
- 🛡️ **Safe by default**: HTML auto-escaping, and expressions that cannot reach JavaScript globals or object internals. See [Security](./SECURITY.md) for what is and is not covered.
- 📊 **Rich filter library**: Date/time, number formatting, text processing, array manipulation, object transformation, and async filters.
- 🐛 **Helpful errors**: Errors throw by default and point at the offending line of the template; a lenient mode and a validator are available.
- 🛫 **Async and streaming**: Async filters and loaders, and `renderStream()` to send a page while it renders.
- 🌐 **Universal compatibility**: Works in both Node.js and browser environments.
- 📦 **Zero dependencies**: About 19 kB minified and gzipped.

## Play Online

[StackBlitz](https://stackblitz.com/edit/janja?file=main.ts)

## Getting Started

```javascript
import { render } from 'janja'

document.body.innerHTML = await render('Hello, {{= name }}！', { name: 'World' })
```

or

```javascript
import { renderFile } from 'janja'

// templates are loaded through the `loader` option, which also resolves `include`
const options = { loader: (path) => fetch(path).then((res) => res.text()) }

document.body.innerHTML = await renderFile('./template.html', { name: 'World' }, options)
```

## Documentation

- [Language specification](./SPEC.md) - Syntax and semantics, backed by a conformance suite
- [Documentation](./documentation.md) - API, CLI and tooling
- [Filters](./FILTERS.md) - Built-in filter reference
- [Security](./SECURITY.md) - What is protected, what is not, and how to report issues
- [Performance](./PERFORMANCE.md) - Caching, pre-compilation and benchmarks

## Ecosystem

- [`janja-cli`](./packages/janja-cli) - pre-compile, watch and check templates
- [`vite-plugin-janja`](./packages/vite-plugin-janja) - import templates in Vite and Rollup
- [`janja-express`](./packages/janja-express), [`janja-koa`](./packages/janja-koa), [`janja-fastify`](./packages/janja-fastify) - server framework integrations
- [`janja-language-server`](./packages/janja-language-server) - language server for any LSP editor
- [`eslint-plugin-janja`](./packages/eslint-plugin-janja) - formatting rules
- [`vscode-janja`](./packages/vscode-janja) - VS Code language support

## License

`Janja` is released under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute it as long as you comply with the license terms.
