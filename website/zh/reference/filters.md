# 过滤器

过滤器对值做变换：`{{= value | name }}` 或 `{{= value | name(argument, ...) }}`。过滤器从左到右串联，每个只作用于它前面的那一个操作数，所以要过滤整个表达式请加圆括号：`{{= (a + b) | fixed }}`。细节见[语言规范](./spec)。

语言没有数组和对象字面量，所以需要它们的示例会列出渲染时用的数据。结果不是字符串时，会再经过 `json` 以便看清内容。本页的每个示例都由测试套件实际运行。

## 字符串过滤器

### `capitalize`

把每个单词的首字母大写。

```janja
{{= "hello world" | capitalize }}
```

输出：`Hello World`

### `lower`

把字符串转为小写。

```janja
{{= "HELLO WORLD" | lower }}
```

输出：`hello world`

### `upper`

把字符串转为大写。

```janja
{{= "hello world" | upper }}
```

输出：`HELLO WORLD`

### `trim`

去掉字符串两端的空白。

```janja
[{{= "  hello world  " | trim }}]
```

输出：`[hello world]`

### `truncate`

把字符串截短到最多 `maxLength` 个字符，并以 `...`（或第二个参数给出的字符串）结尾。

```janja
{{= "This is a very long string" | truncate(10) }}
```

输出：`This is a ...`

```janja
{{= "This is a very long string" | truncate(10, "…") }}
```

输出：`This is a …`

### `replace`

替换模式的每一处匹配。模式是正则表达式。

```janja
{{= "hello world" | replace("world", "there") }}
```

输出：`hello there`

```janja
{{= "a1b22c" | replace("\d+", "-") }}
```

输出：`a-b-c`

### `repeat`

重复字符串。

```janja
{{= "ab" | repeat(3) }}
```

输出：`ababab`

### `split`

把字符串拆成数组。

```janja
{{= "1,2,3" | split(",") | json }}
```

输出：`["1","2","3"]`

### `slugify`

把字符串转为适合放进 URL 的 slug。

```janja
{{= "Hello World! This is a Test" | slugify }}
```

输出：`hello-world-this-is-a-test`

### `wordCount`

统计字符串中的单词数。

```janja
{{= "Hello world from Janja" | wordCount }}
```

输出：`4`

### `stripTags`

去掉字符串中的 HTML 标签。

```janja
{{= html | stripTags }}
```

数据：`{ "html": "<p>Hello <strong>world</strong></p>" }`

输出：`Hello world`

### `urlencode`

对字符串编码，以便用在 URL 中。

```janja
{{= "tom & jerry" | urlencode }}
```

输出：`tom%20%26%20jerry`

### `urldecode`

解码经过 URL 编码的字符串。

```janja
{{= "hello%20world" | urldecode }}
```

输出：`hello world`

## 数字过滤器

### `abs`

返回绝对值。

```janja
{{= -5 | abs }}
```

输出：`5`

### `ceil`

向上取整。

```janja
{{= 4.2 | ceil }}
```

输出：`5`

### `round`

四舍五入到指定的小数位数（默认 0）。

```janja
{{= 4.567 | round(2) }}
```

输出：`4.57`

```janja
{{= 4.567 | round }}
```

输出：`5`

### `fixed`

格式化为固定的小数位数（默认 2）。

```janja
{{= 4.5 | fixed }}
```

输出：`4.50`

```janja
{{= 4.5678 | fixed(1) }}
```

输出：`4.6`

### `percent`

把小数格式化为百分比。

```janja
{{= 0.75 | percent }}
```

输出：`75%`

```janja
{{= 0.1234 | percent(1) }}
```

输出：`12.3%`

### `currency`

把数字格式化为货币。参数：货币代码（默认 `"USD"`）和区域设置（默认 `"en-US"`）。

```janja
{{= 1234.56 | currency }}
```

输出：`$1,234.56`

```janja
{{= 1234.56 | currency("EUR") }}
```

输出：`€1,234.56`

### `add`

加上一个数。

```janja
{{= 5 | add(3) }}
```

输出：`8`

### `sub`

减去一个数。

```janja
{{= 5 | sub(3) }}
```

输出：`2`

### `mul`

乘以一个数。

```janja
{{= 5 | mul(3) }}
```

输出：`15`

### `div`

除以一个数。

```janja
{{= 6 | div(3) }}
```

输出：`2`

### `max`

返回该值与各参数中最大的一个。

```janja
{{= 5 | max(3, 8, 2) }}
```

输出：`8`

### `min`

返回该值与各参数中最小的一个。

```janja
{{= 5 | min(3, 8, 2) }}
```

输出：`2`

### `sum`

对数字数组求和。

```janja
{{= numbers | sum }}
```

数据：`{ "numbers": [1, 2, 3, 4, 5] }`

输出：`15`

### `even`

判断一个数是否为偶数。

```janja
{{= 4 | even }}
```

输出：`true`

### `odd`

判断一个数是否为奇数。

```janja
{{= 3 | odd }}
```

输出：`true`

## 数组过滤器

### `length`

返回数组或字符串的长度。

```janja
{{= items | length }}
```

数据：`{ "items": [1, 2, 3] }`

输出：`3`

```janja
{{= "hello" | length }}
```

输出：`5`

### `first`

返回数组的第一个元素，或字符串的第一个字符。

```janja
{{= items | first }}
```

数据：`{ "items": [1, 2, 3] }`

输出：`1`

### `last`

返回数组的最后一个元素，或字符串的最后一个字符。

```janja
{{= items | last }}
```

数据：`{ "items": [1, 2, 3] }`

输出：`3`

### `join`

用分隔符连接各元素（默认没有分隔符）。

```janja
{{= items | join(", ") }}
```

数据：`{ "items": [1, 2, 3] }`

输出：`1, 2, 3`

### `reverse`

返回数组或字符串反转后的副本。

```janja
{{= items | reverse | json }}
```

数据：`{ "items": [1, 2, 3] }`

输出：`[3,2,1]`

```janja
{{= "abc" | reverse }}
```

输出：`cba`

### `sort`

返回数组或字符串排序后的副本。元素按字符串比较，与 JavaScript 中不带比较函数的 `Array.prototype.sort()` 相同。

```janja
{{= items | sort | json }}
```

数据：`{ "items": ["pear", "apple", "fig"] }`

输出：`["apple","fig","pear"]`

### `unique`

去掉数组或字符串中的重复项。

```janja
{{= items | unique | json }}
```

数据：`{ "items": [1, 2, 2, 3, 1] }`

输出：`[1,2,3]`

### `compact`

去掉 `null` 和 `undefined` 元素。

```janja
{{= items | compact | json }}
```

数据：`{ "items": [1, null, 2, null, 3] }`

输出：`[1,2,3]`

### `slice`

返回数组或字符串中从 `start` 到 `end`（不含 `end`）的部分。

```janja
{{= items | slice(1, 4) | json }}
```

数据：`{ "items": [1, 2, 3, 4, 5] }`

输出：`[2,3,4]`

```janja
{{= "hello" | slice(1) }}
```

输出：`ello`

### `chunk`

把数组按给定大小拆成若干数组。

```janja
{{= items | chunk(2) | json }}
```

数据：`{ "items": [1, 2, 3, 4, 5] }`

输出：`[[1,2],[3,4],[5]]`

### `shuffle`

返回数组随机排序后的副本。

```janja
{{= items | shuffle | json }}
```

数据：`{ "items": [1, 2, 3, 4, 5] }`

### `pluck`

读取每个元素的某一个属性。

```janja
{{= people | pluck("name") | json }}
```

数据：`{ "people": [{ "name": "Alice", "team": "core" }, { "name": "Bob", "team": "docs" }, { "name": "Carol", "team": "core" }] }`

输出：`["Alice","Bob","Carol"]`

### `map`

与 `pluck` 类似，另可为缺少该属性的元素指定默认值。

```janja
{{= people | map("nickname", "n/a") | json }}
```

数据：`{ "people": [{ "name": "Alice", "nickname": "Al" }, { "name": "Bob" }] }`

输出：`["Al","n/a"]`

### `groupby`

按某个属性的值对数组元素分组。

```janja
{{= people | groupby("team") | json }}
```

数据：`{ "people": [{ "name": "Alice", "team": "core" }, { "name": "Bob", "team": "docs" }, { "name": "Carol", "team": "core" }] }`

输出：`{"core":[{"name":"Alice","team":"core"},{"name":"Carol","team":"core"}],"docs":[{"name":"Bob","team":"docs"}]}`

## 对象过滤器

### `keys`

返回对象的键。可以用它遍历对象：`{{ for key of user | keys }}`。

```janja
{{= user | keys | json }}
```

数据：`{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

输出：`["name","age","city"]`

### `values`

返回对象的值。

```janja
{{= user | values | json }}
```

数据：`{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

输出：`["Alice",30,"NYC"]`

### `entries`

返回对象的键值对。

```janja
{{= user | entries | json }}
```

数据：`{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

输出：`[["name","Alice"],["age",30],["city","NYC"]]`

### `get`

按路径读取嵌套的值，路径中某一段不存在时也不会报错。

```janja
{{= account | get("owner", "name") }}
```

数据：`{ "account": { "owner": { "name": "Alice" } } }`

输出：`Alice`

```janja
[{{= account | get("billing", "city") }}]
```

数据：`{ "account": { "owner": { "name": "Alice" } } }`

输出：`[]`

### `pick`

返回只含指定键的对象。

```janja
{{= user | pick("name", "age") | json }}
```

数据：`{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

输出：`{"name":"Alice","age":30}`

### `omit`

返回去掉指定键的对象。

```janja
{{= user | omit("age") | json }}
```

数据：`{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

输出：`{"name":"Alice","city":"NYC"}`

### `defaults`

补上对象没有的键。

```janja
{{= user | defaults(fallbacks) | json }}
```

数据：`{ "user": { "name": "Alice" }, "fallbacks": { "age": 0, "city": "Unknown" } }`

输出：`{"age":0,"city":"Unknown","name":"Alice"}`

### `merge`

合并对象；靠后的优先。

```janja
{{= a | merge(b, c) | json }}
```

数据：`{ "a": { "x": 1 }, "b": { "y": 2 }, "c": { "x": 3 } }`

输出：`{"x":3,"y":2}`

### `invert`

交换键和值。

```janja
{{= codes | invert | json }}
```

数据：`{ "codes": { "ok": 200, "missing": 404 } }`

输出：`{"200":"ok","404":"missing"}`

## 日期过滤器

### `date`

格式化 `Date`，或 JavaScript 能解析为日期的字符串。无效日期得到空字符串。

| 格式 | 结果 |
| ------ | ------ |
| `"ISO"`（默认） | ISO 8601 |
| `"date"` | `YYYY-MM-DD` |
| `"time"` | `HH:MM:SS`，使用执行渲染的机器的时区 |
| `"locale"`、`"locale-time"`、`"locale-datetime"` | 按执行渲染的机器的区域设置格式化 |

```janja
{{= published | date }}
```

数据：`{ "published": "2024-01-15T10:30:00.000Z" }`

输出：`2024-01-15T10:30:00.000Z`

```janja
{{= published | date("date") }}
```

数据：`{ "published": "2024-01-15T10:30:00.000Z" }`

输出：`2024-01-15`

### `timeAgo`

描述某个日期距今多久：`just now`、`5 minutes ago`、`2 hours ago`、`3 days ago`……

```janja
{{= published | timeAgo }}
```

数据：`{ "published": "2024-01-15T10:30:00.000Z" }`

## 工具过滤器

### `safe`

把字符串标记为可信的 HTML，写出时不再转义。只用于你能控制的内容，见[安全](./security)。

```janja
{{= html }}
```

数据：`{ "html": "<b>bold</b>" }`

输出：`&lt;b&gt;bold&lt;/b&gt;`

```janja
{{= html | safe }}
```

数据：`{ "html": "<b>bold</b>" }`

输出：`<b>bold</b>`

### `json`

把值序列化为 JSON，可选缩进。结果不转义。

```janja
{{= user | json }}
```

数据：`{ "user": { "name": "Alice", "tags": ["a", "b"] } }`

输出：`{"name":"Alice","tags":["a","b"]}`

### `fallback`

用默认值替换 `null` 和 `undefined`。第二个参数传 `true` 时，替换所有为假的值，比如 `""` 和 `0`。

```janja
{{= nickname | fallback("Anonymous") }}
```

输出：`Anonymous`

```janja
[{{= "" | fallback("Anonymous") }}]
```

输出：`[]`

```janja
{{= "" | fallback("Anonymous", true) }}
```

输出：`Anonymous`

## 异步过滤器

### `fetchUrl`

请求一个 URL，以文本形式返回响应体。模板会等待它完成。

```janja
{{= "https://api.example.com/motd" | fetchUrl }}
```

### `delay`

在指定的毫秒数之后返回该值。

```janja
{{= "hello" | delay(1000) }}
```

## 串联过滤器

```janja
{{= "  HELLO WORLD  " | trim | lower | capitalize }}
```

输出：`Hello World`

```janja
{{= items | slice(1, 4) | reverse | join(" - ") }}
```

数据：`{ "items": [1, 2, 3, 4, 5] }`

输出：`4 - 3 - 2`

## 自定义过滤器

过滤器是一个函数，接收该值以及随后的各个参数。用 `filters` 选项注册过滤器；它们会加到内置过滤器之上，也可以是 `async` 的：

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  filters: {
    shout: (value: string, times = 1) => value.toUpperCase() + '!'.repeat(times),
  },
});

await renderer.render('{{= "hello" | shout(3) }}', {});
// "HELLO!!!"
```

使用未注册的过滤器，会在表达式求值时报错；`validateTemplate()` 和 `janja check` 可以提前发现。

## 从 Jinja2 迁移

大多数 Jinja2 过滤器在这里有同名的对应。以下几个不同：

| Jinja2 | Janja |
| ------ | ----- |
| `title` | `capitalize` |
| `striptags` | `stripTags` |
| `wordcount` | `wordCount` |
| `default` | `fallback` |
| `tojson` | `json` |
| `escape` | 不需要：输出默认转义 |
| `value \| truncate(10)` | 相同；参数一律写在圆括号里 |
