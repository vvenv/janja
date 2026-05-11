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
- 🚀 **High performance**: LRU cache for compiled templates, pre-compilation support, and optimized string processing.
- 🛡️ **Enhanced security**: Sandbox mode, CSP support, deep escaping, and security audit tools.
- 📊 **Rich filter library**: Date/time, number formatting, text processing, array manipulation, object transformation, and async filters.
- 🐛 **Error handling and debugging**: Provides detailed error reporting and debugging support.
- 🛫 **Asynchronous data loading**: Supports fetching and displaying remote data asynchronously.
- 🌐 **Universal compatibility**: Works in both Node.js and browser environments.
- 📦 **Zero dependencies**: Lightweight with no external dependencies.

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

document.body.innerHTML = await renderFile('./template.html', { name: 'World' })
```

## Documentation

- [Documentation](./documentation.md) - Core documentation
- [Filters](./FILTERS.md) - Built-in filter reference
- [Security](./SECURITY.md) - Security best practices

## License

`Janja` is released under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute it as long as you comply with the license terms.
