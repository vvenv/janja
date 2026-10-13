# Performance

## How Rendering Works

A template is compiled into a JavaScript function once and that function is then called for every render. Compilation is the expensive part, so the important thing is to compile each template only once.

### The compile cache

Every `Renderer` keeps an LRU cache of compiled templates, enabled by default:

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  cache: {
    maxSize: 1000, // templates to keep (default)
    ttl: 3600000, // milliseconds (default: 1 hour); 0 never expires
    revalidate: true, // default, see below
  },
});
```

- **Reuse the renderer.** The cache lives on the instance. The `render()` / `renderFile()` helpers keep one renderer per options object, so they cache too as long as you pass the same object (or none) on every call.
- **Includes are revalidated.** On a cache hit, each included template is re-read through your `loader` and the template is recompiled if one changed. If templates cannot change while the process runs, set `revalidate: false` to skip those loader calls.
- `renderer.getCacheStats()` returns hits, misses, evictions, size and hit rate.

### Pre-compilation

Compile templates at build time and ship plain JavaScript modules, so production never parses a template:

```bash
janja compile ./templates ./dist/templates --recursive
```

```typescript
import { renderCompiled } from 'janja';
import { script } from './dist/templates/page.js';

const html = await renderCompiled(script, data);
```

## Benchmarks

`packages/janja/benchmarks` contains micro-benchmarks and a comparison against Handlebars, EJS, Nunjucks and Eta. The comparison renders the same page (escaped output, nested loops, a conditional, a filter) with a template compiled once per engine, and checks that all engines produce the same HTML before measuring.

```bash
pnpm bench                                   # everything
pnpm --filter janja bench benchmarks/comparison.bench.ts
```

One run on an Apple Silicon laptop with Node.js 26, for orientation only. Run it on your own hardware before drawing conclusions:

| Engine     | Renders per second |
| ---------- | -----------------: |
| Eta        |           ~115,000 |
| **Janja**  |            ~96,000 |
| Handlebars |            ~52,000 |
| EJS        |            ~28,000 |
| Nunjucks   |            ~14,500 |

Janja's rendering is always asynchronous (filters and includes may be async) and every loop has its own scope, which accounts for the remaining gap to Eta.

CI runs the benchmarks on every push and pull request and fails when a benchmark becomes more than twice as slow as on `main`.

## Template Tips

- Do expensive work in your code, not in templates; pass the result as data.
- A loop whose body only outputs values and branches shares one scope across its iterations. As soon as the body assigns (`set`, `capture`, `macro`) or uses another block directive, every iteration gets a copy of the surrounding variables, which costs more in big loops over wide contexts.
- For large pages, `renderStream()` sends output while it is produced instead of building the whole page in memory first.
- Synchronous filters cost a plain function call; only filters that return a promise are awaited.

## Profiling

```bash
node --cpu-prof your-app.js
```

Open the generated `.cpuprofile` in Chrome DevTools or VS Code. Compiled templates show up as anonymous async functions.
