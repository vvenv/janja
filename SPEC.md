# Janja Language Specification

This document defines the template language. [`spec/conformance.json`](./spec/conformance.json) is its executable counterpart: every rule below is covered by cases in that file, and the reference implementation runs all of them in its test suite. Where this text and the suite disagree, the suite is right and the text has a bug.

## 1. Templates

A template is text interleaved with three kinds of tags:

| Tag       | Default delimiters  | Purpose                               |
| --------- | ------------------- | ------------------------------------- |
| Output    | `{{= expression }}` | Write the value of an expression      |
| Directive | `{{ name ... }}`    | Control flow, definitions, inclusion  |
| Comment   | `{{# text #}}`      | Notes for template authors            |

Everything outside a tag is text and is written out unchanged, including line endings.

- All six delimiters are configurable.
- To write a literal brace that would otherwise start or end a tag, escape it with a backslash: `\{\{= a \}\}` produces `{{= a }}`. The same escape works inside string literals.
- Directive names are case-insensitive. Everything else is case-sensitive.
- `{{ name }}` with a name that is not a directive is an error (`Unknown "name"`); output always uses `{{=`.

### 1.1 Whitespace control

A `-` directly inside a delimiter removes all whitespace, including line breaks, of the text on that side of the tag: `{{- ... }}` trims the text before the tag, `{{ ... -}}` the text after it. For output tags the marker follows the `=`: `{{=- value -}}`. This works the same for every tag, wherever it is nested.

The `trimWhitespace` option trims every text segment at both ends.

### 1.2 Comments

A comment is written to the output as an HTML comment, `<!-- text -->`, unless the `stripComments` option is set, in which case it produces nothing. Tags inside a comment are not interpreted.

## 2. Data model

A template is rendered with a *context*: a set of named values made of the renderer's `globals` overlaid with the data passed to the render call. Values are JavaScript values.

- Templates never modify the data they are given. Assignments create or shadow names in the template's own scopes, and filters return new values.
- Each of these creates a nested scope that sees the surrounding names: every iteration of `for`, every `macro` invocation. Names assigned inside do not exist outside.
- `if` does **not** create a scope: a `set` inside an `if` is visible after it.
- `with` creates a scope that contains *only* the properties of its value.

## 3. Expressions

### 3.1 Literals

| Kind      | Examples                          | Notes |
| --------- | --------------------------------- | ----- |
| Number    | `42`, `1.5`, `-2`                 | Decimal only; no exponents, no leading `.` |
| String    | `"double"`, `'single'`, `` `tick` `` | Escapes: `\n` `\t` `\r` `\\` and the quote characters. Any other backslash sequence is kept as written, so `"\d+"` is the three characters `\d+` |
| Boolean   | `true`, `false`                   | |
| Empty     | `null`, `undefined`               | |

There are no array or object literals; pass such values as data.

### 3.2 Names and properties

- `name` reads a value from the context. A name that does not exist is `undefined`; this includes the names every JavaScript object inherits, such as `toString` and `valueOf`, unless the data or the template defines them.
- `a.b.c` reads properties. Only identifiers may follow a dot; there is no `a[b]` and no `a.0`. Reading a property of `null` or `undefined` is an error.
- `f(x, y)` and `a.b(x)` call a function found in the context.
- `f(x, name=value, other=value)` passes named arguments: they are collected into one object that is passed after the positional arguments, here `f(x, { name, other })`. Nothing is assigned in the template's scope.
- These identifiers are forbidden everywhere in an expression: `constructor`, `prototype`, `__proto__`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, `__lookupSetter__`.

### 3.3 Operators

Operators are words, not symbols (except arithmetic). From loosest to tightest binding:

| Level | Operators                                             | Meaning |
| ----- | ----------------------------------------------------- | ------- |
| 1     | `x if test else y`                                    | Conditional. `else` is optional; without it a false test yields an empty value |
| 2     | `=`                                                   | Assignment (`set`, defaults) and named arguments |
| 3     | `or`                                                  | First truthy operand, else the last |
| 4     | `and`                                                 | First falsy operand, else the last |
| 5     | `eq` `ne` `gt` `ge` `lt` `le` `in` `ni` `is`          | Comparison |
| 6     | `+` `-`                                               | Addition (also string concatenation), subtraction |
| 7     | `*` `/` `%`                                           | Multiplication, division, remainder |
| 8     | `not`                                                 | Negation |
| 9     | `\|`                                                  | Filter |
| 10    | `.` and calls                                         | Property access |

- `eq` and `ne` are strict: no type conversion, `1 eq "1"` is false.
- `a in b` is true when `a` is a key (or index) of `b`; `ni` is its negation.
- `x is "type"` compares the JavaScript `typeof x` with a string: `"number"`, `"string"`, `"boolean"`, `"object"`, `"undefined"`, `"function"`.
- `not` binds tighter than comparison: `not a eq 2` means `(not a) eq 2`. Write `not (a eq 2)` or `a ne 2`.
- Parentheses group: `(a + b) * 2`.
- `-` directly before a digit starts a negative number only where an operand is expected; after an operand it is subtraction, so `a -1` and `a - 1` are the same. There is no unary minus for names.
- Truthiness is JavaScript's: `false`, `0`, `""`, `null`, `undefined` and `NaN` are falsy; everything else, including empty arrays and objects, is truthy.
- Two operands without an operator between them (`a b`) are an error.

### 3.4 Filters

`value | name` and `value | name(arg, ...)` call the filter `name` with the value as its first argument. Named arguments work as in calls: `value | name(arg, key=x)` calls the filter with `value`, `arg` and `{ key: x }`. Filters chain left to right. A filter applies to the single operand before it: in `a + b | add(10)` the filter applies to `b`, so use parentheses to filter a whole expression.

Filters may be asynchronous; the template waits for them. Using a filter that is not registered is an error when the expression is evaluated.

## 4. Output

`{{= expression }}` writes the value of the expression:

- `null` and `undefined` write nothing.
- Other values are converted with JavaScript string conversion (arrays join their elements with commas, plain objects become `[object Object]`; use the `json` filter for structured data).
- Unless `autoEscape` is disabled, the result is HTML-escaped: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&#34;`, `'` → `&#39;`.
- Values marked safe (the `safe` filter, `Safe` objects, captured content) are written without escaping.

## 5. Directives

### 5.1 `if`

```janja
{{ if test }}...{{ elif test }}...{{ else }}...{{ endif }}
```

`elseif` and `elsif` are synonyms of `elif`. Branches are tested in order and the first truthy one is rendered.

### 5.2 `for`

```janja
{{ for item of items }}...{{ else }}...{{ endfor }}
```

- Iterates arrays, strings (by character) and any other iterable. `null`, `undefined` and values that are not iterable, including plain objects, are treated as empty; use the `keys`, `values` or `entries` filters to iterate an object.
- The `else` branch is rendered when there is nothing to iterate.
- `{{ for (a, b = default) of items }}` reads the *properties* `a` and `b` of each item; a default applies when the property is `undefined`.
- Inside the body, `loop.index` is the zero-based position, and `loop.first` and `loop.last` are booleans.
- `{{ break }}` ends the innermost loop, `{{ continue }}` skips to its next iteration. Both are errors outside a loop.

### 5.3 `set`

```janja
{{ set name = expression }}
{{ set (a, b) = expression }}
```

Assigns in the current scope. The second form reads the properties `a` and `b` of the value. The target must be a plain name.

### 5.4 `capture`

```janja
{{ capture name }}...{{ endcapture }}
```

Renders the body and assigns the result to `name` instead of writing it. The result is marked safe, so writing it later does not escape it again.

### 5.5 `with`

```janja
{{ with value }}...{{ endwith }}
```

Renders the body in a scope made of the properties of `value` only. Assignments inside do not modify `value`.

### 5.6 `macro`, `caller` and `call`

```janja
{{ macro name(param, other = default) }}...{{ caller }}...{{ endmacro }}
{{ call name(arguments) }}...{{ endcall }}
```

A macro is a named, parameterised piece of template. `call` invokes it and writes its output at the position of the `call`, also when that is inside a `capture`, a `block` or an included template; the body of the `call` is rendered wherever the macro has `{{ caller }}`. Parameters are positional; a default applies when the argument is missing or `undefined`. The macro body sees the names that were in scope where the macro was defined, plus its parameters. `caller` is an error outside a macro.

### 5.7 `include`

```janja
{{ include "path" }}
```

Renders another template in place. The path is a string literal handed to the renderer's `loader`; what it means is up to the loader. The included template sees the top-level context of the including template, including names assigned at the top level before the `include`. A template may include itself, directly or through other templates; includes nested more than 100 levels deep are an error when the template is rendered, which is what an include cycle that never ends runs into. A template that cannot be loaded is an error.

### 5.8 `block` and `super`

```janja
{{ block name }}...{{ endblock }}
```

Blocks implement layouts. All blocks of a template and of the templates it includes are collected by name:

- A block is rendered once, at the position where a block of that name first appears.
- What is rendered there is the *last* definition of that name. A page therefore includes its layout first and then redefines the blocks it wants to replace.
- `{{ super }}` inside a block renders the definition it replaced, and can be chained through several levels. It is an error outside a block.

## 6. Errors

A conforming implementation reports, with the position in the template:

- at compile time: malformed tags and expressions, unknown directives, directives without their required expression or with an expression they do not take, unclosed blocks, closing or branch directives without an opening one, forbidden identifiers, templates that cannot be loaded;
- at render time: reading a property of an empty value, calling something that is not a function, unknown filters, and errors thrown by filters or functions.

By default the first error aborts rendering. In lenient mode (a `debug` handler is supplied) every error is passed to the handler instead: a broken directive is skipped, an unclosed block is closed at the end of the template, unknown and unexpected directives are written as HTML comments, and a template that fails at render time produces an empty string.

Parsing terminates for every input.
