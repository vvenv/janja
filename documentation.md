# Documentation

## Built-in Tags

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

### **block / super**: Template Inheritance & Blocks

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
{{ comment }}Multi-line comment{{ endcomment }}
```

### **expression (=)**: Expression Output

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, ceil, compact, date, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, t, time, trim, truncate, unique, upper, urldecode, urlencode, values

### Examples

```janja
{{= foo | upper }}
{{= list | join:(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## Customization

### Custom Tag

```javascript
const myTag = {
  names: ['my_tag'],
  async compile({ out }) {
    // Compilation logic
    return out.pushStr('Custom tag content')
  },
}
const engine = new Engine({
  compilers: [myTag],
})
```

Usage in template:

```janja
{{ my_tag }}
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

For more details, refer to the source code in `src/filters.ts` and the `src/tag-compilers/` directory.
