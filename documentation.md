# Documentation

## Built-in Directives

### **include**: Template Inheritance & Inclusion

```janja
{{ include "template" }}
```

### **if / elif / else**: Conditional Statements

```janja
{{ if condition }}Content{{ elif other }}Content{{ else }}Content{{ endif }}
```

### **for**: Looping

```janja
{{ for item of array_items }}{{= item }}{{ endfor }}
```

```janja
{{ for item of object_items | values }}{{= item }}{{ endfor }}
```

### **set**: Variable Assignment

```janja
{{ set foo = 123 }}
{{ set (a, b) = obj }}
{{ set foo }}Content{{ endset }}
```

### **block / super**: Block Overriding & Inheritance

Blocks with the same name will automatically overwrite or inherit, and blocks are always rendered where they first appear.

```janja
{{ block title }}{{ super }}Default Title{{ endblock }}
```

### **macro / caller**: Macro Definition & Invocation

```janja
{{ macro my_macro(x, y) }}Content{{ caller }}{{ endmacro }}
```

### **call**: Macro Invocation

```janja
{{ call my_macro("foo", "bar") }}Content{{ endcall }}
```

### **break / continue**: Loop Control

```janja
{{ break }}
{{ continue }}
```

### **comment**: Comments

```janja
{{# This is a comment #}}
```

### **expression (=)**: Expression Output

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, ceil, compact, div, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, mul, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, trim, truncate, unique, upper, urldecode, urlencode, values

### Date/Time Filters

- **date**: Format dates
- **timeAgo**: Display relative time

### Number Formatting Filters

- **round**: Round numbers
- **fixed**: Format numbers with fixed decimal places
- **percent**: Format numbers as percentages
- **currency**: Format numbers as currency

### Text Processing Filters

- **wordCount**: Count words in text
- **stripTags**: Remove HTML tags
- **slugify**: Convert text to URL-friendly slugs

### Array Manipulation Filters

- **shuffle**: Randomly shuffle array elements
- **chunk**: Split array into chunks
- **pluck**: Extract property values from array of objects

### Object Transformation Filters

- **defaults**: Set default values for missing properties
- **invert**: Invert object keys and values
- **merge**: Merge multiple objects

### Async Filters

- **fetchUrl**: Fetch data from a URL (async)
- **delay**: Add delay (async)

### Examples

```janja
{{= foo | upper }}
{{= list | join(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## CLI Tool

Janja provides a CLI tool for pre-compiling templates to improve performance in production.

### Installation

```bash
pnpm add -g janja-cli
```

### Compile Command

Compile a single template file:

```bash
janja compile template.janja ./compiled
```

Compile templates in a directory:

```bash
janja compile ./templates ./compiled
```

Options:
- `-w, --watch`: Watch for file changes and recompile
- `-r, --recursive`: Recursively compile templates in directory

### Watch Command

Watch templates for changes and automatically recompile:

```bash
janja watch ./templates ./compiled
```

Options:
- `-r, --recursive`: Recursively watch templates in directory

### Example

```bash
# Compile all templates
janja compile ./src/templates ./dist/templates

# Watch for changes during development
janja watch ./src/templates ./dist/templates
```

## Customization

### Custom Directive

```typescript
class CustomNode extends Traversal {
  readonly type = 'CUSTOM'
  constructor(public readonly loc: Loc) {
    super();
  }
}
render('{{ custom }}', {}, {
  parsers: {
    async *custom(token) {
      yield 'NEXT';
      yield new CustomNode(token.loc);
    },
  },
  compilers: {
    CUSTOM: async (node, compiler) => {
      compiler.pushStr(node.loc, '<CUSTOM/>')
    },
  },
})
```

### Custom Filter

```javascript
const engine = new Engine({
  filters: {
    my_filter(value) {
      return `Custom: ${value}`
    },
  },
})
```

Usage in template:

```janja
{{= foo | my_filter }}
```

---

For more details, refer to the source code in `packages/janja/src/filters.ts` and `packages/janja/src/plugins/`.
