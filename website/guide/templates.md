# Template Tour

This page walks through the language by example. Every example is live: press **Edit** to change the template or its data, or open it in the [playground](/playground). For the precise rules, see the [language specification](/reference/spec).

## Output

`{{= expression }}` writes the value of an expression. `null` and `undefined` write nothing.

```janja live
Hello, {{= user.name }}! You are {{= user.age }}.
Missing values are empty: [{{= user.nickname }}]
---
{ "user": { "name": "Ada", "age": 36 } }
```

Output is HTML-escaped unless you mark it as trusted with the `safe` filter:

```janja live
{{= comment }}
{{= comment | safe }}
---
{ "comment": "<em>Nice!</em>" }
```

## Expressions

Operators are words: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `and`, `or`, `not`, `in`. Arithmetic uses the usual symbols, and `x if test else y` chooses between two values.

```janja live
{{= price * quantity }}
{{= "in stock" if quantity gt 0 else "sold out" }}
{{= "bulk order" if quantity ge 10 and not discount }}
{{= name + "!" }}
---
{ "name": "Notebook", "price": 4.5, "quantity": 12, "discount": false }
```

There are no array or object literals, and only names may follow a dot (`a.b`, not `a[b]`). Pass structured values as data.

## Filters

A filter transforms the value before it: `value | name` or `value | name(arguments)`. Filters chain from left to right.

```janja live
{{= title | upper }}
{{= title | truncate(12) }}
{{= tags | sort | join(", ") }}
{{= price | currency("EUR") }}
{{= missing | fallback("n/a") }}
---
{ "title": "Templates that compile", "tags": ["fast", "small", "safe"], "price": 12.5 }
```

A filter applies to the single operand before it, so use parentheses to filter a whole expression:

```janja live
{{= a + b | fixed }}
{{= (a + b) | fixed }}
---
{ "a": 1, "b": 2 }
```

All built-in filters are listed in the [filter reference](/reference/filters), and you can [add your own](./customization).

## Conditions

```janja live
{{ if score ge 90 }}
  Excellent
{{ elif score ge 60 }}
  Passed
{{ else }}
  Try again
{{ endif }}
---
{ "score": 72 }
```

## Loops

`for ... of` iterates arrays, strings and other iterables. Inside the body, `loop.index` is the zero-based position, and `loop.first` and `loop.last` are booleans. The optional `else` branch renders when there is nothing to iterate.

```janja live
{{ for fruit of fruits }}
  {{= loop.index + 1 }}. {{= fruit }}{{= " (last)" if loop.last }}
{{ else }}
  No fruit.
{{ endfor }}
---
{ "fruits": ["apple", "pear", "fig"] }
```

Parentheses read properties of each item, with optional defaults:

```janja live
{{ for (name, role = "member") of people }}
  {{= name }}: {{= role }}
{{ endfor }}
---
{ "people": [{ "name": "Ada", "role": "admin" }, { "name": "Grace" }] }
```

To loop over an object, use the `keys`, `values` or `entries` filters. `{{ break }}` and `{{ continue }}` work as you would expect:

```janja live
{{ for key of settings | keys }}
  {{ if key eq "secret" }}{{ continue }}{{ endif }}
  {{= key }}
{{ endfor }}
---
{ "settings": { "theme": "dark", "secret": "hunter2", "pageSize": 20 } }
```

## Variables

`set` assigns a name in the current scope, and `capture` assigns the rendered body of a block. Templates never modify the data they are given.

```janja live
{{ set total = price * quantity }}
{{ set (city, zip) = address }}
{{ capture label }}{{= quantity }} × {{= price | currency }}{{ endcapture }}
{{= label }} = {{= total | currency }}, shipped to {{= city }} {{= zip }}
---
{ "price": 4.5, "quantity": 3, "address": { "city": "Hangzhou", "zip": "310000" } }
```

`with` renders its body in a scope made of the properties of a value:

```janja live
{{ with author }}{{= name }} <{{= email }}>{{ endwith }}
---
{ "author": { "name": "Ada", "email": "ada@example.com" } }
```

## Macros

A macro is a named, parameterised piece of template. `call` invokes it, and the body of the `call` is rendered where the macro says `{{ caller }}`.

```janja live
{{ macro button(label, kind = "default") }}
  <button class="btn btn-{{= kind }}">{{= label }}{{ caller }}</button>
{{ endmacro }}

{{ call button("Save", "primary") }}{{ endcall }}
{{ call button("Delete") }} <kbd>⌫</kbd>{{ endcall }}
```

## Includes and Layouts

`{{ include "path" }}` renders another template in place; the renderer's `loader` decides what the path means. Blocks implement layouts: a page includes its layout first, and then redefines the blocks it wants to replace. `{{ super }}` renders the definition that was replaced.

::: code-group

```janja [page.janja]
{{ include "layout" }}

{{ block title }}About · {{ super }}{{ endblock }}

{{ block content }}
  <h1>About</h1>
{{ endblock }}
```

```janja [layout.janja]
<html>
  <head>
    <title>{{ block title }}My Site{{ endblock }}</title>
  </head>
  <body>
    {{ block content }}{{ endblock }}
  </body>
</html>
```

:::

Includes need more than one template, so this one is not live here: [open the layout example in the playground](/playground?example=layout).

## Whitespace and Comments

Text outside tags is written as it is, including line breaks. A `-` inside a delimiter removes the whitespace on that side of the tag; for output tags it follows the `=`.

```janja live
<ul>
  {{- for item of items }}
  <li>{{= item }}</li>
  {{- endfor }}
</ul>
[  {{=- "trimmed on both sides" -}}  ]
---
{ "items": ["one", "two"] }
```

A comment is written as an HTML comment, or left out entirely with the `stripComments` option. To write a literal brace pair, escape it with backslashes:

```janja live
{{# not rendered as a tag #}}
\{\{= name \}\}
```

## Next Steps

- [Filter reference](/reference/filters)
- [Error handling](./errors)
- [Language specification](/reference/spec)
