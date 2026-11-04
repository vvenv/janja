# Migrating to Janja

Cheat sheet for moving templates from Nunjucks / Jinja2, Handlebars or EJS.
Full language rules: [SPEC.md](./SPEC.md). Filter list: [FILTERS.md](./FILTERS.md).

## Delimiters at a glance

| Role        | Janja           | Nunjucks / Jinja2 | Handlebars      | EJS            |
| ----------- | --------------- | ----------------- | --------------- | -------------- |
| Output      | `{{= expr }}`   | `{{ expr }}`      | `{{expr}}`      | `<%= expr %>`  |
| Raw HTML    | `{{= expr \| safe }}` or `Safe` | `{{ expr \| safe }}` | `{{{expr}}}` | `<%- expr %>` |
| Directive   | `{{ name ... }}` | `{% name ... %}` | `{{#name}}`…`{{/name}}` | `<% code %>` |
| Comment     | `{{# text #}}`  | `{# text #}`      | `{{! text }}`   | `<%# text %>`  |

Janja always uses `{{= ... }}` for output. Bare `{{ name }}` is a **directive**, not interpolation — that is the most common migration footgun.

Whitespace trim uses `-` inside the tag, same idea as Jinja/Nunjucks: `{{- ... }}`, `{{ ... -}}`, `{{=- ... -}}`.

## From Nunjucks / Jinja2

### Output and filters

```jinja
{{ user.name | upper }}
{{ html | safe }}
```

```janja
{{= user.name | upper }}
{{= html | safe }}
```

Filter names often match (`upper`, `lower`, `join`, `default` → Janja’s `fallback`, `length`, …). Check [FILTERS.md](./FILTERS.md) for gaps; register missing ones with `defineFilters`.

### Control flow

```jinja
{% if ready %}…{% elif other %}…{% else %}…{% endif %}
{% for item in items %}…{% else %}…{% endfor %}
{% set x = 1 %}
```

```janja
{{ if ready }}…{{ elif other }}…{{ else }}…{{ endif }}
{{ for item of items }}…{{ else }}…{{ endfor }}
{{ set x = 1 }}
```

Notes:

- Loop keyword is **`of`**, not `in` (`in` is a comparison operator in expressions).
- Loop metadata is `loop.index` / `loop.first` / `loop.last` (0-based `index`, no `loop.index0`).
- `break` / `continue` exist inside `for`.

### Inheritance

Nunjucks/Jinja `extends` + `{% block %}` map to **include the layout first, then redefine blocks**:

```janja
{{ include "layout.janja" }}
{{ block content }}Page body{{ endblock }}
```

Inside a block, `{{ super }}` chains to the previous definition (multi-level).

### Macros

```jinja
{% macro input(name, value='') %}…{% endmacro %}
{{ input('email') }}
```

```janja
{{ macro input(name, value='') }}…{{ endmacro }}
{{= input('email') }}
```

Caller / call blocks: `{{ call name(...) }}…{{ endcall }}` with `{{ caller }}` inside the macro.

### Includes

`{% include "partial.html" %}` → `{{ include "partial.html" }}`. Paths go through the renderer’s `loader`; confine the loader yourself for untrusted names.

### Expressions

Janja expressions are **not** Python/JS. Use word operators: `and` `or` `not` `eq` `ne` `gt` `ge` `lt` `le` `in` `ni`. There are no array/object literals in templates — pass them as data.

## From Handlebars

| Handlebars                         | Janja                                      |
| ---------------------------------- | ------------------------------------------ |
| `{{name}}`                         | `{{= name }}`                              |
| `{{{html}}}`                       | `{{= html \| safe }}`                      |
| `{{#if cond}}…{{else}}…{{/if}}`    | `{{ if cond }}…{{ else }}…{{ endif }}`     |
| `{{#each items}}…{{/each}}`        | `{{ for item of items }}…{{ endfor }}`     |
| `{{this}}` / `{{@index}}`          | loop variable / `loop.index`               |
| `{{> partial}}`                    | `{{ include "partial" }}`                  |
| `{{#with user}}…{{/with}}`         | `{{ with user }}…{{ endwith }}`            |
| Helpers                            | filters (`\| name`) or context functions   |
| Partials with hash args            | macros or pass data into `include` context |

Handlebars helpers become either:

- a **filter**: `{{= value | helper(arg) }}`, or
- a **function on the data/globals** you pass into `render`.

Layouts: prefer `include` + `block` / `super` rather than wrapping helpers.

## From EJS

EJS embeds JavaScript. Janja does not — rewrite control flow as directives and keep logic in the data you pass in.

| EJS                         | Janja                                      |
| --------------------------- | ------------------------------------------ |
| `<%= name %>`               | `{{= name }}`                              |
| `<%- html %>`               | `{{= html \| safe }}`                      |
| `<% if (x) { %>…<% } %>`    | `{{ if x }}…{{ endif }}`                   |
| `<% items.forEach(...) %>`  | `{{ for item of items }}…{{ endfor }}`     |
| `<%# comment %>`            | `{{# comment #}}`                          |
| `include('file')`           | `{{ include "file" }}`                     |

Anything that needs real JavaScript (I/O, complex transforms) belongs in the caller or in a registered filter/plugin, not in the template.

## API mapping

```javascript
// Nunjucks-style mental model
import { Renderer, createFileLoader } from 'janja';

const renderer = new Renderer({
  loader: createFileLoader('./views', { extensions: ['.janja', '.html'] }),
  // autoEscape: true by default
});

await renderer.renderFile('page.janja', { title: 'Hi' });
```

Frameworks: `janja-express`, `janja-koa`, `janja-fastify`. Build-time compile: `janja-cli` / `vite-plugin-janja`.

## Checklist

1. Replace every `{{ expr }}` output with `{{= expr }}`.
2. Switch `{% … %}` / `{{#…}}` control tags to `{{ … }}` directives with matching `end*` tags.
3. Change `for … in` to `for … of`.
4. Map `extends` layouts to `include` + `block`.
5. Register filters you relied on that Janja does not ship.
6. Point `loader` at your template root; enable `security` limits if templates are not fully trusted ([SECURITY.md](./SECURITY.md)).
7. Run `janja check` / `validateTemplate` in CI.

## Still stuck?

- Language rules: [SPEC.md](./SPEC.md)
- Playground: <https://janja.wenfu.dev/playground>
- Security boundaries: [SECURITY.md](./SECURITY.md)
