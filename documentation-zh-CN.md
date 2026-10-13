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
```

### **capture**：捕获渲染内容

```janja
{{ capture foo }}内容{{ endcapture }}
{{= foo }}
```

### **with**：局部上下文

```janja
{{ with user }}{{= name }}{{ endwith }}
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

## 错误处理

- **默认抛出错误**：模板有语法错误时 `render()` 以 `CompileError` 拒绝，运行时出错以 `RenderError` 拒绝，`error.details` 会标出模板中的出错行。
- **宽松模式**：传入 `debug` 回调后，错误交给回调处理；出错的指令被跳过，未闭合的块在模板末尾自动闭合，运行时失败的模板渲染为空字符串。
- **缺失的值**：`null` 和 `undefined` 输出为空字符串，对它们做 `for` 循环会进入 `else` 分支。
- **模板校验**：`validateTemplate(template, options?)` 使用真实的解析器，返回全部语法错误（含行列号）以及未注册过滤器的警告。

```typescript
import { render, validateTemplate } from 'janja';

const html = await render(template, data, {
  debug: (error) => console.warn(error.details ?? error.message),
});

const { valid, errors, warnings } = await validateTemplate(template);
```

## CLI 工具

`janja-cli` 在构建期把模板预编译成 ES 模块，运行时不再解析或编译模板。

### 安装

```bash
pnpm add -D janja-cli
```

### 编译命令

```bash
# 单个文件
janja compile template.janja ./compiled

# 目录中的所有 .janja 和 .html 文件
janja compile ./templates ./compiled --recursive
```

选项：
- `-r, --recursive`: 同时编译子目录中的模板（保留目录结构）
- `--runtime`: 额外导出可直接调用的 `render(data, options)` 函数

`{{ include "partials/footer" }}` 相对输入目录解析（扩展名可省略），并内联到编译产物中。模板有错误时命令以非零状态码退出。

### 监听命令

先完整编译一次，之后模板新增、修改或删除时重新编译：

```bash
janja watch ./templates ./compiled --recursive
```

### 使用编译产物

```typescript
import { renderCompiled } from 'janja';
import { script } from './compiled/page.js';

const html = await renderCompiled(script, { title: 'Hello' });
```

## 自定义

### 自定义指令

```typescript
import { render, Traversal, type Loc } from 'janja';

class CustomNode extends Traversal {
  readonly type = 'CUSTOM';

  constructor(public readonly loc: Loc) {
    super();
  }
}

await render('{{ custom }}', {}, {
  parsers: {
    *custom(token) {
      yield 'NEXT';
      yield new CustomNode(token.loc);
    },
  },
  compilers: {
    CUSTOM: (node, compiler) => {
      compiler.pushStr(node.loc, '<CUSTOM/>');
    },
  },
});
// "<CUSTOM/>"
```

### 自定义过滤器

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  filters: {
    my_filter(value) {
      return `自定义：${value}`;
    },
  },
});
```

模板中即可使用

```janja
{{= foo | my_filter }}
```

---

如需更多细节，可参考源码 `packages/janja/src/filters.ts` 和 `packages/janja/src/plugins/`。
