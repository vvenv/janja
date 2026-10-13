# 安全

## Janja 防范什么

### 跨站脚本：输出默认转义

用 `{{= ... }}` 写出的一切都会做 HTML 转义（`&`、`<`、`>`、`"`、`'`），除非你主动关闭。

```javascript
import { render } from 'janja';

await render('{{= input }}', { input: '<script>alert(1)</script>' });
// &lt;script&gt;alert(1)&lt;/script&gt;
```

对你信任的 HTML，可以逐个值关闭转义：

```javascript
import { render, Safe } from 'janja';

await render('{{= html }} {{= other | safe }}', {
  html: new Safe('<b>trusted</b>'),
  other: '<i>also trusted</i>',
});
```

保持 `autoEscape: true`（默认值）。转义针对的是 HTML 文本和带引号的属性值；它不能让一个值在 `<script>`、内联事件处理器、CSS 或不带引号的属性里变得安全。向脚本传数据用 `json` 过滤器，URL 的组成部分用 `urlencode`。

`security.deepEscape: true` 改变数组和对象的写出方式：不再使用默认的字符串形式，而是把其中的值转义后拼接起来。

### 表达式离不开你给它的数据

模板表达式不是 JavaScript。它可以读取你传入的数据和 globals 的属性，调用其中的函数，使用已注册的过滤器。它不能引用 `process`、`globalThis`、`require` 这类 JavaScript 全局对象。

标识符 `constructor`、`prototype`、`__proto__`、`__defineGetter__`、`__defineSetter__`、`__lookupGetter__` 和 `__lookupSetter__` 出现在表达式的任何位置都会在编译期被拒绝，内置的 `get`、`pick` 和 `map` 过滤器也不接受它们作为键。这就堵住了从普通对象摸到 `Function` 构造函数的常见路径。

### 限制 globals：沙箱模式

`security.sandbox` 把*渲染器级别*的 `globals` 限制在一份白名单内。传给单次 `render()` 调用的数据始终可用。

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  globals: { site, db },
  security: {
    sandbox: true,
    allowedGlobals: ['site'], // 模板看不到 `db`
  },
});
```

沙箱模式下会加入 `Math`、`Date` 和 `JSON`。

## Janja 不防范什么

**没有额外隔离时，不要渲染不可信的人写的模板。** Janja 不是加固过的沙箱：

- 模板可以调用从你传入的数据和 globals 出发能访问到的任何函数。如果你传入的对象带有一个删除文件的方法，模板就能调用它。请只传纯数据。
- 自定义过滤器和插件以完整权限运行。
- 没有 CPU 和内存限制。模板可以遍历一个巨大的集合，或者通过宏递归，直到进程耗尽资源。
- `include` 加载的是你的 `loader` 为所请求路径返回的内容。如果模板作者不可信，loader 必须自己限制路径范围。

如果必须运行不可信的模板，请放在带资源限制的独立进程或 isolate 中，并且只传 JSON 式的数据。

## 审计辅助

`renderer.auditTemplate(template)` 扫描模板文本中的几种可疑写法（`eval(`、`Function(`、`require(`、`import(`）。它是 lint 级别的启发式检查，不是安全边界：结果干净并不代表模板安全。

## 内容安全策略

Janja 不会给你的页面添加 CSP 响应头或 nonce。`renderer.getCSPHeaders()` 只是一个小工具，把你配置的 nonce 格式化成响应头：

```javascript
const renderer = new Renderer({ security: { cspNonce: nonce } });

renderer.getCSPHeaders();
// { 'Content-Security-Policy': "script-src 'nonce-...'" }
```

每个响应生成一个新的 nonce，自己发送响应头，并把 nonce 作为数据传给模板，用在 `<script nonce="...">` 标签上。

## 检查清单

- [ ] `autoEscape` 保持开启
- [ ] `safe` / `Safe` 只用于你自己生成或清洗过的 HTML
- [ ] 模板来自你自己的代码库，或者在隔离的进程中运行
- [ ] 传给模板的是纯数据，不带有威力的方法
- [ ] `loader` 不会被引导到模板目录之外
- [ ] 在 CI 中校验模板（`validateTemplate`）

## 报告安全问题

请不要公开提 issue。请通过 GitHub 私下报告漏洞：<https://github.com/vvenv/janja/security/advisories/new>。
