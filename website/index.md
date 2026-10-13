---
layout: home
title: Janja
titleTemplate: A template engine for Node.js and browsers

hero:
  name: Janja
  text: Templates that compile to JavaScript
  tagline: A simple, fast, lightweight and extensible template engine for Node.js and browsers.
  image:
    src: /logo.svg
    alt: Janja
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Try the Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/vvenv/janja

features:
  - title: Small language, fully specified
    details: Output, conditions, loops, macros, layouts and filters. Every rule of the specification is backed by a conformance suite.
    link: /reference/spec
    linkText: Read the specification
  - title: Fast
    details: Templates compile to JavaScript functions, cached per renderer or pre-compiled at build time into plain ES modules.
    link: /reference/performance
    linkText: Benchmarks
  - title: Safe by default
    details: Output is HTML-escaped, and expressions cannot reach JavaScript globals or object internals.
    link: /reference/security
    linkText: What is and is not covered
  - title: Errors that point at the template
    details: Errors throw by default and show the offending line. A lenient mode and a validator are there when you need them.
    link: /guide/errors
    linkText: Error handling
  - title: Async and streaming
    details: Async filters and loaders, and renderStream() to send the start of a page while the rest still renders.
    link: /guide/api#renderstream
    linkText: Streaming
  - title: Tooling included
    details: A CLI, a formatter, a language server, a VS Code extension, a Vite plugin, and adapters for Express, Koa and Fastify.
    link: /guide/ecosystem
    linkText: Ecosystem
---

<div class="vp-doc home-example">

## Try it

Edit the template or its data; it renders in your browser.

```janja live
<h1>Hello, {{= name | capitalize }}!</h1>
{{ for task of tasks }}
  <p>{{= loop.index + 1 }}. {{= task.title }}{{= " ✓" if task.done }}</p>
{{ else }}
  <p>Nothing to do.</p>
{{ endfor }}
---
{
  "name": "world",
  "tasks": [
    { "title": "Write a template", "done": true },
    { "title": "Render it", "done": false }
  ]
}
```

```bash
npm install janja
```

</div>
