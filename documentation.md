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
{{ macro my_macro = (x, y) }}Content{{ caller }}{{ endmacro }}
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
{{# This is a comment }}
```

### **expression (=)**: Expression Output

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, ceil, compact, div, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, mul, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, trim, truncate, unique, upper, urldecode, urlencode, values

### Examples

```janja
{{= foo | upper }}
{{= list | join(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## Customization

### Custom Directive

```typescript
class CustomNode extends Traversal {
  readonly type = 'CUSTOM'
  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super()
  }
}
render('{{ custom }}', {}, {
  parsers: {
    custom: (token, parser) => {
      parser.advance()
      return new CustomNode(token.val, token.loc, token.strip)
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

For more details, refer to the source code in `src/filters.ts`, `src/directive-parsers/`, and `src/node-compilers/`.
