![](https://repository-images.githubusercontent.com/989161365/d61a6f29-b7e9-4fbe-8ea2-adac36ea8f44)

    蒹葭
    诗经·国风·秦风〔先秦〕

    蒹葭苍苍，白露为霜。
    所谓伊人，在水一方。
    溯洄从之，道阻且长。
    溯游从之，宛在水中央。

    蒹葭萋萋，白露未晞。
    所谓伊人，在水之湄。
    溯洄从之，道阻且跻。
    溯游从之，宛在水中坻。

    蒹葭采采，白露未已。
    所谓伊人，在水之涘。
    溯洄从之，道阻且右。
    溯游从之，宛在水中沚。

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
- 🚀 **预编译**：通过预编译提升渲染性能。
- 🐛 **错误处理与调试**：详细的错误报告和调试支持。
- 🛡️ **安全性**：自动转义。
- 🛫 **异步数据加载**：支持异步获取和展示远程数据。
- 🌐 **全平台兼容**：同时支持 Node.js 和浏览器环境。
- 📦 **零依赖**：轻量无外部依赖。

## 在线试玩

[StackBlitz](https://stackblitz.com/edit/janja?file=main.ts)

## 快速开始

```javascript
import { render } from 'janja'

document.body.innerHTML = await render('{{= name }} 苍苍，白露为霜', { name: '蒹葭' })
```

or

```javascript
import { renderFile } from 'janja'

document.body.innerHTML = await renderFile('./template.html', { name: '蒹葭' })
```

[使用文档](./documentation-zh-CN.md)

## 许可证

`Janja` 在 [MIT 许可证](https://opensource.org/licenses/MIT) 下发布。你可以自由使用、修改和分发它，只要你遵守许可证条款。
