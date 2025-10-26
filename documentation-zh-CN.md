# 使用文档

## 内置标签

### **if / elif / else**：条件判断

```janja
{{ if condition }}内容{{ elif other }}内容{{ else }}内容{{ endif }}
```

### **for**：循环遍历

```janja
{{ for item of array_items }}{{= item }}{{ endfor }}
```

```janja
{{ for item of object_items | values }}{{= item }}{{ endfor }}
```

### **set**：变量赋值

```janja
{{ set foo = 123 }}
{{ set (a, b) = obj }}
{{ set foo }}内容{{ endset }}
```

### **block / super**：模板继承与区块

```janja
{{ block title }}{{ super }}默认标题{{ endblock }}
```

### **macro / caller**：宏定义与调用

```janja
{{ macro my_macro = (x, y) }}内容{{ caller }}{{ endmacro }}
```

### **call**：调用宏

```janja
{{ call my_macro("foo", "bar") }}内容{{ endcall }}
```

### **break / continue**：循环控制

```janja
{{ break }}
{{ continue }}
```

### **comment**：注释

```janja
{{# 这是注释 }}
{{ comment }}多行注释{{ endcomment }}
```

### **expression（=）**：表达式输出

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## 内置过滤器

abs, capitalize, add, ceil, compact, div, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, mul, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, trim, truncate, unique, upper, urldecode, urlencode, values

### 示例

```janja
{{= foo | upper }}
{{= list | join(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## 自定义

### 自定义标签

```javascript
const myTag = {
  names: ['my_tag'],
  async compile({ out }) {
    // 编译逻辑
    return out.pushStr('自定义标签内容')
  },
}
const engine = new Engine({
  compilers: [myTag],
})
```

模板中即可使用

```janja
{{ my_tag }}
```

### 自定义过滤器

```javascript
const engine = new Engine({
  filters: {
    my_filter(value) {
      return `自定义：${value}`
    },
  },
})
```

模板中即可使用

```janja
{{= foo | my_filter }}
```

---

如需更多细节，可参考源码 `src/filters.ts` 和 `src/tag-compilers/` 目录实现。
