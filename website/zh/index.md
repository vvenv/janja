---
layout: home
title: 蒹葭
titleTemplate: 适用于 Node.js 和浏览器的模板引擎

hero:
  name: 蒹葭 Janja
  text: 编译为 JavaScript 的模板
  tagline: 一个简单、快速、轻量且可扩展的 Node.js 和浏览器模板引擎。
  image:
    src: /logo.svg
    alt: Janja
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 打开演练场
      link: /zh/playground
    - theme: alt
      text: GitHub
      link: https://github.com/vvenv/janja

features:
  - title: 小而完整的语言
    details: 输出、条件、循环、宏、布局和过滤器。语言规范中的每条规则都有一致性测试用例对应。
    link: /zh/reference/spec
    linkText: 阅读语言规范
  - title: 快
    details: 模板编译为 JavaScript 函数，按渲染器缓存，也可以在构建期预编译为普通的 ES 模块。
    link: /zh/reference/performance
    linkText: 基准测试
  - title: 默认安全
    details: 输出默认做 HTML 转义，表达式无法访问 JavaScript 全局对象或对象内部属性。
    link: /zh/reference/security
    linkText: 覆盖范围与限制
  - title: 指向模板的错误信息
    details: 默认抛出错误并标出模板中的出错行；需要时可以使用宽松模式和模板校验器。
    link: /zh/guide/errors
    linkText: 错误处理
  - title: 异步与流式渲染
    details: 支持异步过滤器和加载器；renderStream() 可以在页面其余部分仍在渲染时先发送开头。
    link: /zh/guide/api#renderstream
    linkText: 流式渲染
  - title: 工具齐全
    details: 命令行、格式化、语言服务器、VS Code 扩展、Vite 插件，以及 Express、Koa、Fastify 适配。
    link: /zh/guide/ecosystem
    linkText: 生态
---

<div class="vp-doc home-example">

## 试一试

修改模板或数据，结果直接在浏览器里渲染。

```janja live
<h1>{{= name }}苍苍，白露为霜</h1>
{{ for task of tasks }}
  <p>{{= loop.index + 1 }}. {{= task.title }}{{= " ✓" if task.done }}</p>
{{ else }}
  <p>没有待办事项。</p>
{{ endfor }}
---
{
  "name": "蒹葭",
  "tasks": [
    { "title": "写一个模板", "done": true },
    { "title": "渲染它", "done": false }
  ]
}
```

```bash
npm install janja
```

</div>
