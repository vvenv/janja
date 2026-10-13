# 模板速览

本页通过示例介绍整个语言。每个示例都可以运行：点击**编辑**修改模板或数据，或者在[演练场](/zh/playground)中打开。精确的规则见[语言规范](/zh/reference/spec)。

## 输出

`{{= 表达式 }}` 输出表达式的值。`null` 和 `undefined` 不输出任何内容。

```janja live
你好，{{= user.name }}！你今年 {{= user.age }} 岁。
缺失的值为空：[{{= user.nickname }}]
---
{ "user": { "name": "Ada", "age": 36 } }
```

输出默认做 HTML 转义，除非用 `safe` 过滤器把它标记为可信内容：

```janja live
{{= comment }}
{{= comment | safe }}
---
{ "comment": "<em>不错！</em>" }
```

## 表达式

运算符是单词：`eq`、`ne`、`gt`、`ge`、`lt`、`le`、`and`、`or`、`not`、`in`。算术运算使用常见符号，`x if test else y` 在两个值之间选择。

```janja live
{{= price * quantity }}
{{= "有货" if quantity gt 0 else "售罄" }}
{{= "批量订单" if quantity ge 10 and not discount }}
{{= name + "！" }}
---
{ "name": "笔记本", "price": 4.5, "quantity": 12, "discount": false }
```

语言没有数组和对象字面量，点号后面只能跟名字（`a.b`，不能写 `a[b]`）。结构化的值请通过数据传入。

## 过滤器

过滤器对它前面的值做变换：`value | name` 或 `value | name(参数)`。多个过滤器从左到右依次执行。

```janja live
{{= title | upper }}
{{= title | truncate(12) }}
{{= tags | sort | join("、") }}
{{= price | currency("CNY", "zh-CN") }}
{{= missing | fallback("暂无") }}
---
{ "title": "Templates that compile", "tags": ["fast", "small", "safe"], "price": 12.5 }
```

过滤器只作用于它前面的那一个操作数，要对整个表达式使用过滤器请加括号：

```janja live
{{= a + b | fixed }}
{{= (a + b) | fixed }}
---
{ "a": 1, "b": 2 }
```

全部内置过滤器见[过滤器参考](/zh/reference/filters)，也可以[添加自己的过滤器](./customization)。

## 条件

```janja live
{{ if score ge 90 }}
  优秀
{{ elif score ge 60 }}
  及格
{{ else }}
  再试一次
{{ endif }}
---
{ "score": 72 }
```

## 循环

`for ... of` 遍历数组、字符串和其他可迭代对象。循环体内，`loop.index` 是从 0 开始的位置，`loop.first` 和 `loop.last` 是布尔值。没有可遍历的内容时渲染可选的 `else` 分支。

```janja live
{{ for fruit of fruits }}
  {{= loop.index + 1 }}. {{= fruit }}{{= "（最后一个）" if loop.last }}
{{ else }}
  没有水果。
{{ endfor }}
---
{ "fruits": ["苹果", "梨", "无花果"] }
```

括号可以读取每一项的属性，并可指定默认值：

```janja live
{{ for (name, role = "成员") of people }}
  {{= name }}：{{= role }}
{{ endfor }}
---
{ "people": [{ "name": "Ada", "role": "管理员" }, { "name": "Grace" }] }
```

遍历对象请使用 `keys`、`values` 或 `entries` 过滤器。`{{ break }}` 和 `{{ continue }}` 的行为与你预期的一致：

```janja live
{{ for key of settings | keys }}
  {{ if key eq "secret" }}{{ continue }}{{ endif }}
  {{= key }}
{{ endfor }}
---
{ "settings": { "theme": "dark", "secret": "hunter2", "pageSize": 20 } }
```

## 变量

`set` 在当前作用域中给名字赋值，`capture` 把一段内容的渲染结果赋给名字。模板永远不会修改传入的数据。

```janja live
{{ set total = price * quantity }}
{{ set (city, zip) = address }}
{{ capture label }}{{= quantity }} × {{= price | currency }}{{ endcapture }}
{{= label }} = {{= total | currency }}，寄往{{= city }} {{= zip }}
---
{ "price": 4.5, "quantity": 3, "address": { "city": "杭州", "zip": "310000" } }
```

`with` 在一个仅由某个值的属性构成的作用域中渲染内容：

```janja live
{{ with author }}{{= name }} <{{= email }}>{{ endwith }}
---
{ "author": { "name": "Ada", "email": "ada@example.com" } }
```

## 宏

宏是一段有名字、带参数的模板。用 `call` 调用它，`call` 的内容会渲染在宏里写 `{{ caller }}` 的位置。

```janja live
{{ macro button(label, kind = "default") }}
  <button class="btn btn-{{= kind }}">{{= label }}{{ caller }}</button>
{{ endmacro }}

{{ call button("保存", "primary") }}{{ endcall }}
{{ call button("删除") }} <kbd>⌫</kbd>{{ endcall }}
```

## 包含与布局

`{{ include "path" }}` 在当前位置渲染另一个模板，路径的含义由渲染器的 `loader` 决定。布局通过 block 实现：页面先包含布局，再重新定义想要替换的 block。`{{ super }}` 渲染被替换掉的那个定义。

::: code-group

```janja [page.janja]
{{ include "layout" }}

{{ block title }}关于 · {{ super }}{{ endblock }}

{{ block content }}
  <h1>关于</h1>
{{ endblock }}
```

```janja [layout.janja]
<html>
  <head>
    <title>{{ block title }}我的网站{{ endblock }}</title>
  </head>
  <body>
    {{ block content }}{{ endblock }}
  </body>
</html>
```

:::

包含需要多个模板，所以这个示例不能在这里直接运行：[在演练场中打开布局示例](/zh/playground?example=layout)。

## 空白与注释

标签之外的文本原样输出，包括换行。定界符内侧的 `-` 会去掉标签那一侧的空白；对输出标签，它写在 `=` 之后。

```janja live
<ul>
  {{- for item of items }}
  <li>{{= item }}</li>
  {{- endfor }}
</ul>
[  {{=- "两侧的空白都被去掉" -}}  ]
---
{ "items": ["一", "二"] }
```

注释会输出为 HTML 注释，开启 `stripComments` 选项后则完全不输出。要输出字面的花括号对，请用反斜杠转义：

```janja live
{{# 不会被当作标签渲染 #}}
\{\{= name \}\}
```

## 接下来

- [过滤器参考](/zh/reference/filters)
- [错误处理](./errors)
- [语言规范](/zh/reference/spec)
