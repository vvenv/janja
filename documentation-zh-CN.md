# 使用文档

## 内置指令

### **include**：模板继承与包含

```janja
{{ include "template" }}
```

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

### **block / super**：区块覆盖与继承

同名区块自动覆盖或继承，区块总是渲染在第一次出现的地方

```janja
{{ block title }}{{ super }}默认标题{{ endblock }}
```

### **macro / caller**：宏定义与调用

```janja
{{ macro my_macro(x, y) }}内容{{ caller }}{{ endmacro }}
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
{{# 这是注释 #}}
```

### **expression（=）**：表达式输出

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## 内置过滤器

abs, capitalize, add, ceil, compact, div, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, mul, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, trim, truncate, unique, upper, urldecode, urlencode, values

### 日期/时间过滤器

- **date**: 格式化日期
- **timeAgo**: 显示相对时间

### 数字格式化过滤器

- **round**: 四舍五入
- **fixed**: 固定小数位数
- **percent**: 格式化为百分比
- **currency**: 格式化为货币

### 文本处理过滤器

- **wordCount**: 统计单词数
- **stripTags**: 移除 HTML 标签
- **slugify**: 转换为 URL 友好的 slug

### 数组操作过滤器

- **shuffle**: 随机打乱数组元素
- **chunk**: 将数组分块
- **pluck**: 从对象数组中提取属性值

### 对象转换过滤器

- **defaults**: 为缺失的属性设置默认值
- **invert**: 反转对象的键和值
- **merge**: 合并多个对象

### 异步过滤器

- **fetchUrl**: 从 URL 获取数据（异步）
- **delay**: 添加延迟（异步）

### 示例

```janja
{{= foo | upper }}
{{= list | join(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## CLI 工具

Janja 提供了一个 CLI 工具用于预编译模板，以提高生产环境性能。

### 安装

```bash
pnpm add -g janja-cli
```

### 编译命令

编译单个模板文件：

```bash
janja compile template.janja ./compiled
```

编译目录中的模板：

```bash
janja compile ./templates ./compiled
```

选项：
- `-w, --watch`: 监听文件变化并重新编译
- `-r, --recursive`: 递归编译目录中的模板

### 监听命令

监听模板变化并自动重新编译：

```bash
janja watch ./templates ./compiled
```

选项：
- `-r, --recursive`: 递归监听目录中的模板

### 示例

```bash
# 编译所有模板
janja compile ./src/templates ./dist/templates

# 开发时监听变化
janja watch ./src/templates ./dist/templates
```

## 自定义

### 自定义指令

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

如需更多细节，可参考源码 `packages/janja/src/filters.ts` 和 `packages/janja/src/plugins/`。
