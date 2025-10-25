# 使用文档

## 内置标签

### **if / elif / else**：条件判断

```jianjia
{{ if condition }}内容{{ elif other }}内容{{ else }}内容{{ endif }}
```

### **for**：循环遍历

```jianjia
{{ for item of array_items }}{{= item }}{{ endfor }}
```

```jianjia
{{ for item of object_items | values }}{{= item }}{{ endfor }}
```

### **set**：变量赋值

```jianjia
{{ set foo = 123 }}
{{ set (a, b) = obj }}
{{ set foo }}内容{{ endset }}
```

### **block / super**：模板继承与区块

```jianjia
{{ block title }}{{ super }}默认标题{{ endblock }}
```

### **macro / caller**：宏定义与调用

```jianjia
{{ macro my_macro = (x, y) }}内容{{ caller }}{{ endmacro }}
```

### **call**：调用宏

```jianjia
{{ call my_macro("foo", "bar") }}内容{{ endcall }}
```

### **break / continue**：循环控制

```jianjia
{{ break }}
{{ continue }}
```

### **comment**：注释

```jianjia
{{# 这是注释 }}
{{ comment }}多行注释{{ endcomment }}
```

### **expression（=）**：表达式输出

```jianjia
{{= foo | upper }}
{{= a if cond else b }}
```

## 内置过滤器

abs, capitalize, add, ceil, compact, date, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, minus, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sum, t, time, trim, truncate, unique, upper, urldecode, urlencode, values

### 示例

```jianjia
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
  tags: [myTag],
})
```

模板中即可使用

```jianjia
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

```jianjia
{{= foo | my_filter }}
```

---

如需更多细节，可参考源码 `packages/template/src/filters.ts` 和 `packages/template/src/tags/` 目录实现。
