# janja-express

[Janja](https://github.com/vvenv/janja) view engine for Express 4 and 5.

```bash
pnpm add janja janja-express
```

```js
import express from 'express';
import { engine } from 'janja-express';

const app = express();

app.engine('janja', engine());
app.set('view engine', 'janja');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('home', { title: 'Hello' });
});
```

- `{{ include "partials/footer" }}` is resolved relative to the `views` directory, with or without the extension. Includes cannot point outside of it.
- `app.locals`, `res.locals` and the data passed to `res.render` are all available to the view.
- Errors in a view are passed to Express' error handling.
- Compiled views are cached according to Express' `view cache` setting, which is on in production. While it is off, changes to views and includes show up on the next request.

## Options

`engine(options)` accepts every Janja renderer option except `loader` (`globals`, `filters`, `plugins`, `autoEscape`, `cache`, `debug`, ...), plus:

| Option      | Default                 | Description |
| ----------- | ----------------------- | ----------- |
| `root`      | the `views` directory   | Directory that include paths are resolved against |
| `extension` | the view's extension    | Extension tried when an include path has none |

If views never change while the server runs, pass `cache: { revalidate: false }` to skip re-reading included templates on each request.
