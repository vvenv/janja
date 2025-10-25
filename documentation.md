# Documentation

## Built-in Tags

### **if / elif / else**: Conditional Statements

```jianjia
{{ if condition }}Content{{ elif other }}Content{{ else }}Content{{ endif }}
```

### **for**: Looping

```jianjia
{{ for item of array_items }}{{= item }}{{ endfor }}
```

```jianjia
{{ for item of object_items | values }}{{= item }}{{ endfor }}
```

### **set**: Variable Assignment

```jianjia
{{ set foo = 123 }}
{{ set (a, b) = obj }}
{{ set foo }}Content{{ endset }}
```

### **block / super**: Template Inheritance & Blocks

```jianjia
{{ block title }}{{ super }}Default Title{{ endblock }}
```

### **macro / caller**: Macro Definition & Invocation

```jianjia
{{ macro my_macro = (x, y) }}Content{{ caller }}{{ endmacro }}
```

### **call**: Macro Invocation

```jianjia
{{ call my_macro("foo", "bar") }}Content{{ endcall }}
```

### **break / continue**: Loop Control

```jianjia
{{ break }}
{{ continue }}
```

### **comment**: Comments

```jianjia
{{# This is a comment }}
{{ comment }}Multi-line comment{{ endcomment }}
```

### **expression (=)**: Expression Output

```jianjia
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, ceil, compact, date, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, minus, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sum, t, time, trim, truncate, unique, upper, urldecode, urlencode, values

### Examples

```jianjia
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

```jianjia
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

```jianjia
{{= foo | my_filter }}
```

---

For more details, refer to the source code in `packages/template/src/filters.ts` and the `packages/template/src/tags/` directory.
