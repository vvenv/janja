# 蒹葭

<p align="center">一个简单、快速、轻量且可扩展的 Node.js 和浏览器模板引擎。</p>

<p align="center">
  <a href="https://github.com/vvenv/janja/actions/workflows/test.yml"><img src="https://github.com/vvenv/janja/actions/workflows/test.yml/badge.svg" alt="test"></a>
</p>

<p align="center">
  <a href="./README.md">English</a>
</p>

## 主要特点

- 📝 **直观的模板语法**：简单易懂的变量、条件和循环语法。
- 🔄 **布局与片段**：支持模板继承和可复用组件。
- 🛠️ **内置指令和过滤器**：丰富的内置指令和过滤器集合。
- 🎨 **自定义指令和过滤器**：可扩展自定义指令和过滤器。
- 🚀 **快速**：模板编译为 JavaScript 函数，按渲染器缓存，也可在构建期预编译。见[基准测试](./PERFORMANCE.md#benchmarks)。
- 🛡️ **默认安全**：HTML 自动转义，表达式无法访问 JavaScript 全局对象或对象内部属性。覆盖范围与限制见[安全说明](./SECURITY.md)。
- 📊 **丰富的过滤器库**：日期/时间、数字格式化、文本处理、数组操作、对象转换和异步过滤器。
- 🐛 **清晰的错误**：默认抛出错误并指向模板中的出错行；另有宽松模式和模板校验器。
- 🛫 **异步与流式渲染**：支持异步过滤器和加载器，`renderStream()` 可边渲染边发送页面。
- 🌐 **全平台兼容**：同时支持 Node.js 和浏览器环境。
- 📦 **零依赖**：压缩并 gzip 后约 19 kB。

## 在线试玩

在[演练场](https://janja.wenfu.dev/zh/playground)中试用，引擎直接运行在你的浏览器里。

## 快速开始

```javascript
import { render } from 'janja'

document.body.innerHTML = await render('{{= name }} 苍苍，白露为霜', { name: '蒹葭' })
```

or

```javascript
import { renderFile } from 'janja'

// 模板通过 `loader` 选项加载，`include` 也由它解析
const options = { loader: (path) => fetch(path).then((res) => res.text()) }

document.body.innerHTML = await renderFile('./template.html', { name: '蒹葭' }, options)
```

## 文档

文档站点：**[janja.wenfu.dev/zh](https://janja.wenfu.dev/zh/)**。同样的内容也在本仓库中：

- [使用文档](./documentation-zh-CN.md) - 核心文档
- [过滤器](./FILTERS.md) - 内置过滤器参考
- [安全](./SECURITY.md) - 安全最佳实践

## 许可证

`Janja` 在 [MIT 许可证](https://opensource.org/licenses/MIT) 下发布。你可以自由使用、修改和分发它，只要你遵守许可证条款。
