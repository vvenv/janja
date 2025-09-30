# Documentation

## Built-in Tags

### **if / elif / else**: Conditional Statements

```jianjia
{{ #if condition }}Content{{ elif other }}Content{{ else }}Content{{ /if }}
```

### **for**: Looping

```jianjia
{{ #for item in items }}{{= item }}{{ /for }}
```

### **assign**: Variable Assignment

```jianjia
{{ assign foo = 123 }}
{{ assign a, b = obj }}
{{ #assign foo }}Content{{ /assign }}
```

### **block / super**: Template Inheritance & Blocks

```jianjia
{{ #block title }}{{ super }}Default Title{{ /block }}
```

### **macro / caller**: Macro Definition & Invocation

```jianjia
{{ #macro my_macro: x, y }}Content{{ caller }}{{ /macro }}
{{ my_macro 1 2 }}
```

### **call**: Macro Invocation

```jianjia
{{ #call my_macro "foo" "bar" }}Content{{ /call }}
```

### **break / continue**: Loop Control

```jianjia
{{ break }}
{{ continue }}
```

### **comment**: Comments

```jianjia
{{! This is a comment }}
{{ #comment }}Multi-line comment{{ /comment }}
```

### **expression (=)**: Expression Output

```jianjia
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, date, entries, even, fallback, first, groupby, join, json, keys, last, length, lower, map, max, min, minus, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sum, t, time, trim, unique, upper, values

### Examples

```jianjia
{{= foo | upper }}
{{= list | join: "," }}
{{= obj | keys }}
{{= arr | groupby: key_name }}
```

## Customization

### Custom Tag

```javascript
const myTag = {
  names: ['my_tag'],
  parse({ ast, base }) {
    // Parsing logic
    ast.start({ ...base, name: 'my_tag' })
    ast.end({ ...base, start: base.end, name: 'end_my_tag' })
  },
  async compile({ template, tag, context, out }, compileContent) {
    // Compilation logic
    out.pushStr('Custom tag content')
  },
}
const engine = new Engine()

engine.registerTags([myTag])
```

Usage in template:

```jianjia
{{ my_tag }}
```

### Custom Filter

```javascript
const engine = new Engine()

engine.registerFilters({
  my_filter(value) {
    return `Custom: ${value}`
  },
})
```

Usage in template:

```jianjia
{{= foo | my_filter }}
```

---

For more details, refer to the source code in `packages/template/src/filters.ts` and the `packages/template/src/tags/` directory.
