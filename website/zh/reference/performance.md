# 性能

## 渲染是怎么进行的

模板只编译一次，变成一个 JavaScript 函数，之后每次渲染都调用这个函数。编译是开销大的部分，所以关键是每个模板只编译一次。

### 编译缓存

每个 `Renderer` 都带一个已编译模板的 LRU 缓存，默认开启：

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  cache: {
    maxSize: 1000, // 保留的模板数量（默认）
    ttl: 3600000, // 毫秒（默认 1 小时）；0 表示永不过期
    revalidate: true, // 默认，见下文
  },
});
```

- **复用渲染器。** 缓存挂在实例上。`render()` / `renderFile()` 这两个辅助函数为每个选项对象保留一个渲染器，所以只要每次调用传的是同一个对象（或者都不传），它们同样有缓存。
- **被包含的模板会重新校验。** 命中缓存时，每个被包含的模板都会通过你的 `loader` 重新读取，有变化就重新编译。如果进程运行期间模板不会变，把 `revalidate` 设为 `false` 可以省掉这些 loader 调用。
- `renderer.getCacheStats()` 返回命中数、未命中数、淘汰数、当前大小和命中率。

### 预编译

在构建期编译模板，发布纯 JavaScript 模块，生产环境就不用再解析模板：

```bash
janja compile ./templates ./dist/templates --recursive
```

```typescript
import { renderCompiled } from 'janja';
import { script } from './dist/templates/page.js';

const html = await renderCompiled(script, data);
```

## 基准测试

`packages/janja/benchmarks` 里有微基准测试，以及与 Handlebars、EJS、Nunjucks 和 Eta 的对比。对比测试让每个引擎用只编译一次的模板渲染同一个页面（转义输出、嵌套循环、一个条件、一个过滤器），并在计时之前确认所有引擎产出相同的 HTML。

```bash
pnpm bench                                   # 全部
pnpm --filter janja bench benchmarks/comparison.bench.ts
```

下面是在一台 Apple Silicon 笔记本上用 Node.js 26 跑的一次结果，仅供参考。下结论之前请在你自己的硬件上跑一遍：

| 引擎       | 每秒渲染次数 |
| ---------- | -----------: |
| Eta        |     ~124,000 |
| **Janja**  |     ~111,000 |
| Handlebars |      ~54,500 |
| EJS        |      ~30,700 |
| Nunjucks   |      ~15,500 |

一次渲染的大部分时间花在转义上，所以上面的数字主要反映数据里有多少内容需要转义。Janja 的渲染始终是异步的（过滤器和 include 都可能是异步的），但在这里几乎没有代价：为这个页面生成同步函数，测不出差别。

CI 在每次 push 和 pull request 时，在同一台机器上分别为这次改动和它所基于的提交运行基准测试，某项基准慢了两倍以上时会失败。比较之前会先扣除机器本身的波动：其他引擎在两次运行之间的变化被视为机器的漂移，所以中途变慢的 runner 不会被算作性能回退。

## 模板写法建议

- 开销大的工作放在你的代码里做，不要放在模板里；把结果作为数据传入。
- 循环体如果只输出值和做分支，各次迭代共用一个作用域。一旦循环体里有赋值（`set`、`capture`、`macro`）或用了其他块指令，每次迭代都会得到外层变量的一份拷贝；上下文很宽、循环很大时，这个开销更明显。
- 对于大页面，`renderStream()` 边生成边发送输出，不必先在内存里拼出整个页面。
- 同步过滤器的开销就是一次普通函数调用；只有返回 promise 的过滤器才会被 await。

## 性能剖析

```bash
node --cpu-prof your-app.js
```

用 Chrome DevTools 或 VS Code 打开生成的 `.cpuprofile`。已编译的模板显示为匿名的异步函数。
