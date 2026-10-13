# 使用文档

## 内置指令

<!-- #region directives -->

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

<!-- #endregion directives -->

## 内置过滤器

<!-- #region filters -->

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

<!-- #endregion filters -->

## 错误处理

<!-- #region errors -->

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

<!-- #endregion errors -->

## CLI 工具

<!-- #region cli -->

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

<!-- #endregion cli -->

## API 参考

<!-- #region api -->

### render()

用数据渲染模板字符串：

```typescript
import { render } from 'janja';

const result = await render('Hello {{= name }}!', { name: 'World' });
// "Hello World!"
```

### renderFile()

渲染通过 `loader` 选项加载的模板：

```typescript
import { readFile } from 'node:fs/promises';
import { renderFile } from 'janja';

const options = { loader: (path) => readFile(`./templates/${path}.janja`, 'utf-8') };

const result = await renderFile('page', { name: 'World' }, options);
```

`{{ include "..." }}` 也由同一个 loader 解析。没有 loader 时，被包含的模板为空。

### Renderer

`render()` 和 `renderFile()` 会为每个选项对象复用一个渲染器，所以每次调用都传同一个对象才能用上编译缓存；也可以自己创建渲染器：

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  // 所有模板都能读到的值
  globals: { siteName: 'My Site' },
  // 对输出做 HTML 转义（默认：true）
  autoEscape: true,
  // 为 renderFile() 和 include 加载模板
  loader: async (path) => '...',
  // 接收错误，而不是抛出
  debug: (error) => console.warn(error),
  cache: {
    enabled: true, // 默认
    maxSize: 1000, // 保留的已编译模板数量（默认）
    ttl: 3600000, // 毫秒（默认 1 小时），0 表示永不过期
    revalidate: true, // 每次命中缓存时重新读取被包含的模板（默认）
  },
});

await renderer.render('Hello {{= name }} from {{= siteName }}!', { name: 'World' });
```

缓存管理：`renderer.clearCache()`、`renderer.invalidateCache(predicate?)`、`renderer.getCacheStats()`。

### precompileTemplate() / renderCompiled()

```typescript
import { precompileTemplate, renderCompiled } from 'janja';

// 构建期：返回一个导出 `script` 的 ES 模块的源码
const moduleSource = await precompileTemplate('Hello {{= name }}!', { loader });

// 运行时
import { script } from './hello.js';

await renderCompiled(script, { name: 'World' });
```

### validateTemplate()

```typescript
import { validateTemplate } from 'janja';

const { valid, errors, warnings } = await validateTemplate('Hello {{= name }}');
```

### renderStream()

渲染为字符串的 [`ReadableStream`](https://developer.mozilla.org/docs/Web/API/ReadableStream)，页面开头可以在其余部分还在渲染时就先发出去：

```typescript
import { renderStream } from 'janja';

const stream = renderStream(template, data);

// Node.js
for await (const chunk of stream) {
  response.write(chunk);
}

// Fetch API / 边缘运行时
return new Response(stream.pipeThrough(new TextEncoderStream()));
```

输出在模板的顶层片段之间、顶层循环的各次迭代之间（包括顶层 `if` 里的循环）写出，每块约 1,000 个字符。`capture`、`macro`、`block` 和被包含模板里的内容整体产出。流遵守背压，取消流会停止渲染。出错时流被拒绝；宽松模式下错误交给 `debug`，流正常结束。

### 带类型的模板

```typescript
import { defineFilters, Renderer } from 'janja';

const renderer = new Renderer({
  // 参数类型在定义过滤器的地方检查
  filters: defineFilters({
    shout: (value: string, times = 1) => value.toUpperCase() + '!'.repeat(times),
  }),
});

// 把模板和它需要的数据类型绑定起来
const page = renderer.template<{ title: string; items?: string[] }>(source);

await page({ title: 'Hello' });
```

对于预编译模板，`janja compile --dts` 会为每个模板生成一个声明文件，其中的 `TemplateData` 接口列出模板读取的数据。

### analyzeTemplate()

静态分析模板需要什么。被包含的模板会通过 `loader` 一并分析：

```typescript
import { analyzeTemplate } from 'janja';

await analyzeTemplate('{{ for item of items }}{{= item.name | upper }}{{ endfor }}{{= title }}');
// {
//   variables: ['items', 'title'],
//   filters: ['upper'],
//   includes: [], blocks: [], macros: [],
// }
```

### formatTemplate()

```typescript
import { formatTemplate } from 'janja';

formatTemplate('<p>{{=name|upper}}</p>{{if a  eq 1}}x{{endif}}');
// '<p>{{= name | upper }}</p>{{ if a eq 1 }}x{{ endif }}'
```

只改动标签内部；文本、空白控制标记和多行注释保持原样。只有能证明改写后解析出同一个表达式时，标签才会被改写。

### createFileLoader()

面向 Node.js 的现成 `loader`：从一个目录读取模板，扩展名可写可不写，并拒绝指向该目录之外的路径：

```typescript
import { createFileLoader, Renderer } from 'janja';

const renderer = new Renderer({ loader: createFileLoader('./templates') });

await renderer.renderFile('pages/home', data);
```

### Source map

`precompile()` 返回模块，并附带一份指回模板的标准（第 3 版）source map：

```typescript
import { precompile } from 'janja';

const { code, map, dts } = await precompile(template, {
  sourceMap: true,
  filename: 'page.janja',
  dts: true,
});
```

`janja compile --source-map` 和 `vite-plugin-janja` 都用它，所以堆栈和调试器显示的是模板里的行号。

<!-- #endregion api -->

## 自定义

<!-- #region customization -->

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

<!-- #endregion customization -->

## 最佳实践

<!-- #region best-practices -->

### 1. 在 CI 中校验模板

```typescript
import { readFile } from 'node:fs/promises';
import { validateTemplate } from 'janja';

for (const file of templateFiles) {
  const { valid, errors } = await validateTemplate(await readFile(file, 'utf-8'));

  if (!valid) {
    console.error(file, errors);
    process.exitCode = 1;
  }
}
```

### 2. 复用同一个渲染器

编译缓存挂在 `Renderer` 实例上。启动时创建一个并一直复用，不要每个请求都新建选项对象。如果进程运行期间模板不会变，把 `cache.revalidate` 设为 `false`，可以省掉重新读取被包含模板的开销。

### 3. 生产环境预编译

```bash
janja compile ./templates ./dist/templates --recursive
```

### 4. 保持自动转义开启

让 `autoEscape` 保持开启，用 `safe` 过滤器或 `new Safe(html)` 显式标记可信的 HTML。渲染不可信的人写的模板之前，先读[安全说明](./SECURITY.md)。

### 5. 决定错误如何暴露

开发和测试时让错误直接抛出。生产环境要么在 `render()` 外层捕获，要么传入 `debug` 处理函数：把错误上报到错误追踪系统，页面去掉出错的部分照常渲染。

### 6. 用 block 组织模板

```janja
{{# base.janja #}}
<html>
<head>
  {{ block head }}<title>默认标题</title>{{ endblock }}
</head>
<body>
  {{ block content }}默认内容{{ endblock }}
</body>
</html>
```

```janja
{{# page.janja #}}
{{ include "base" }}
{{ block head }}<title>我的页面</title>{{ endblock }}
{{ block content }}<h1>我的内容</h1>{{ endblock }}
```

<!-- #endregion best-practices -->

## 疑难排查

<!-- #region troubleshooting -->

### `Unknown "name"`

`{{ name }}` 是指令。输出值要写 `{{= name }}`。

### 变量什么都没输出

`null` 和 `undefined` 渲染为空字符串。检查拼写（名称区分大小写），确认传入的数据里有这个值，或者给它一个默认值：`{{= name | fallback("匿名") }}`。

### 被包含的模板是空的

`include` 需要 `loader` 选项；默认的 loader 返回空模板。

### 渲染很慢

- 复用同一个 `Renderer`（或同一个选项对象），已编译的模板才会被缓存
- 生产环境预编译模板
- 在 `packages/janja` 下运行 `pnpm bench`，在你自己的机器上和其他引擎对比

### 安全方面的顾虑

见[安全说明](./SECURITY.md)。

<!-- #endregion troubleshooting -->
