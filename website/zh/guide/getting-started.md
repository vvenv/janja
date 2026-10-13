# 快速开始

蒹葭（Janja）把模板和数据变成文本。模板会被编译成 JavaScript 函数，所以凡是能运行 JavaScript 的地方都能用：Node.js 18 及以上、浏览器和边缘运行时。它没有任何依赖。

## 安装

<ReleaseNotice />

::: code-group

```bash [npm]
npm install janja
```

```bash [pnpm]
pnpm add janja
```

```bash [yarn]
yarn add janja
```

:::

## 渲染模板

```typescript
import { render } from 'janja';

const html = await render('你好，{{= name }}！', { name: '世界' });
// "你好，世界！"
```

`render()` 始终返回 Promise，因为过滤器和模板加载都可以是异步的。

标签有三种：`{{= 表达式 }}` 输出一个值，`{{ 指令 }}` 控制渲染什么，`{{# 文字 #}}` 是注释：

```janja live
{{# 向名单上的每个人问好 #}}
{{ for name of names }}
  你好，{{= name | capitalize }}！
{{ endfor }}
---
{ "names": ["ada", "grace"] }
```

[模板速览](./templates)用可编辑的示例带你过一遍整个语言，[演练场](/zh/playground)适合自由尝试。

## 渲染文件

模板通常保存在文件里，并且相互包含。告诉渲染器如何加载它们，并且只创建一次渲染器，这样编译结果才会被缓存：

```typescript
import { createFileLoader, Renderer } from 'janja';

const renderer = new Renderer({
  loader: createFileLoader('./templates'),
});

// 渲染 ./templates/pages/home.janja
const html = await renderer.renderFile('pages/home', { title: '首页' });
```

`{{ include "partials/header" }}` 也由同一个加载器解析。加载器只是一个从路径到模板源码的函数，所以模板可以来自任何地方：

```typescript
const renderer = new Renderer({
  loader: (path) => fetch(`/templates/${path}.html`).then((res) => res.text()),
});
```

## 在浏览器中使用

使用打包工具时，像上面那样导入 `janja` 即可。不使用打包工具时，可以从 CDN 加载模块：

```html
<script type="module">
  import { render } from 'https://esm.sh/janja';

  document.body.innerHTML = await render('你好，{{= name }}！', {
    name: '世界',
  });
</script>
```

在浏览器中编译模板会用到 `new Function`，严格的内容安全策略（CSP）会禁止它。这种情况下请[预编译](./cli)模板。

## 配合 Web 框架

[Express、Koa 和 Fastify](./ecosystem) 都有现成的适配，另有在构建期编译模板的 [Vite 插件](./ecosystem)。

## 接下来

- [模板速览](./templates)：通过示例了解语言
- [错误处理](./errors)：模板出错时会发生什么
- [API](./api)：渲染、流式渲染、预编译和类型化模板
- [语言规范](/zh/reference/spec)：精确的规则
