# janja-fastify

[Janja](https://github.com/vvenv/janja) view rendering for Fastify 5.

```bash
pnpm add janja janja-fastify
```

```js
import Fastify from 'fastify';
import { janjaView } from 'janja-fastify';

const fastify = Fastify();

await fastify.register(janjaView, { root: './views' });

fastify.get('/', (request, reply) => reply.view('home', { title: 'Hello' }));
```

- `reply.view(view, data)` renders `views/home.janja` and sends it as an HTML response. The view sees `reply.locals`, if you set it in a hook, overlaid with `data`.
- `fastify.view(view, data)` renders to a string, for emails and the like.
- Views and `{{ include "partials/footer" }}` are resolved inside the views directory, with or without the extension, and cannot point outside of it.
- Each view is compiled once and recompiled only when it, or a template it includes, changes on disk.
- Errors in a view reject the handler, so Fastify's error handling applies.

## Options

Every Janja renderer option except `loader` (`globals`, `filters`, `plugins`, `autoEscape`, `cache`, `debug`, ...), plus:

| Option      | Default    | Description |
| ----------- | ---------- | ----------- |
| `root`      | required   | Directory of the views |
| `extension` | `'.janja'` | Extension of the views, used when a view or include is named without one |

If views never change while the server runs, pass `cache: { revalidate: false }` to skip re-reading included templates on each request.
