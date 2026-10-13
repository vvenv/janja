# janja-koa

[Janja](https://github.com/vvenv/janja) view rendering for Koa.

```bash
pnpm add janja janja-koa
```

```js
import Koa from 'koa';
import { views } from 'janja-koa';

const app = new Koa();

app.use(views('./views'));

app.use(async (ctx) => {
  await ctx.render('home', { title: 'Hello' });
});
```

- `ctx.render(view, data)` renders `views/home.janja` as an HTML response. The view sees `ctx.state` overlaid with `data`.
- Views and `{{ include "partials/footer" }}` are resolved inside the views directory, with or without the extension, and cannot point outside of it.
- Each view is compiled once and recompiled only when it, or a template it includes, changes on disk.
- Errors in a view reject `ctx.render`, so Koa's error handling applies.

## Options

`views(root, options)` accepts every Janja renderer option except `loader` (`globals`, `filters`, `plugins`, `autoEscape`, `cache`, `debug`, ...), plus:

| Option      | Default    | Description |
| ----------- | ---------- | ----------- |
| `extension` | `'.janja'` | Extension of the views, used when a view or include is named without one |

If views never change while the server runs, pass `cache: { revalidate: false }` to skip re-reading included templates on each request.
