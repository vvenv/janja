import type { TemplateFile } from './engine';

export interface Example {
  id: string;
  title: { en: string; zh: string };
  files: TemplateFile[];
  data: unknown;
}

export const examples: Example[] = [
  {
    id: 'hello',
    title: { en: 'Hello', zh: '你好' },
    files: [
      {
        name: 'main',
        content: `<h1>Hello, {{= name | capitalize }}!</h1>

<p>You have {{= messages | length }} new {{= "message" if messages | length eq 1 else "messages" }}.</p>

<p>{{= bio | fallback("No bio yet.") | truncate(40) }}</p>
`,
      },
    ],
    data: {
      name: 'world',
      messages: ['Hi!', 'Lunch?', 'Ping'],
      bio: 'Template engines turn data into text, and this one does it quickly.',
    },
  },
  {
    id: 'loops',
    title: { en: 'Conditions and loops', zh: '条件与循环' },
    files: [
      {
        name: 'main',
        content: `<ul>
{{ for (name, price, stock = 0) of products }}
  <li class="{{= "first" if loop.first }}">
    {{= loop.index + 1 }}. {{= name }}: {{= price | currency("USD") }}
    {{- if stock eq 0 }} <em>(sold out)</em>
    {{- elif stock lt 5 }} <em>(only {{= stock }} left)</em>
    {{- endif }}
  </li>
{{ else }}
  <li>Nothing for sale.</li>
{{ endfor }}
</ul>

{{ set total = products | pluck("price") | sum }}
<p>Total: {{= total | currency("USD") }}</p>
`,
      },
    ],
    data: {
      products: [
        { name: 'Notebook', price: 4.5, stock: 12 },
        { name: 'Fountain pen', price: 32, stock: 3 },
        { name: 'Ink', price: 9.9 },
      ],
    },
  },
  {
    id: 'layout',
    title: { en: 'Layouts: include and block', zh: '布局：include 与 block' },
    files: [
      {
        name: 'main',
        content: `{{# include the layout first, then replace its blocks #}}
{{ include "layout" }}

{{ block title }}{{= post.title }} · {{ super }}{{ endblock }}

{{ block content }}
<article>
  <h1>{{= post.title }}</h1>
  {{ include "byline" }}
  {{= post.html | safe }}
</article>
{{ endblock }}
`,
      },
      {
        name: 'layout',
        content: `<!doctype html>
<html>
<head>
  <title>{{ block title }}{{= site }}{{ endblock }}</title>
</head>
<body>
  <main>{{ block content }}{{ endblock }}</main>
  <footer>{{ block footer }}© {{= site }}{{ endblock }}</footer>
</body>
</html>
`,
      },
      {
        name: 'byline',
        content: `<p class="byline">by {{= post.author }} · {{= post.tags | join(", ") }}</p>
`,
      },
    ],
    data: {
      site: 'Reed Notes',
      post: {
        title: 'Templates that compile',
        author: 'Wen',
        tags: ['janja', 'templates'],
        html: '<p>Each template becomes a <strong>JavaScript function</strong>.</p>',
      },
    },
  },
  {
    id: 'macros',
    title: { en: 'Macros', zh: '宏' },
    files: [
      {
        name: 'main',
        content: `{{ macro card(title, tone = "info") }}
<section class="card card-{{= tone }}">
  <h2>{{= title }}</h2>
  {{ caller }}
</section>
{{ endmacro }}

{{ call card("Deploy finished") }}
  <p>Version {{= version }} is live.</p>
{{ endcall }}

{{ call card("Disk almost full", "warning") }}
  <p>{{= disk | percent(0) }} used.</p>
{{ endcall }}
`,
      },
    ],
    data: { version: '2.9.0', disk: 0.93 },
  },
  {
    id: 'whitespace',
    title: { en: 'Whitespace, comments and scopes', zh: '空白、注释与作用域' },
    files: [
      {
        name: 'main',
        content: `{{# a comment becomes an HTML comment, unless "Strip comments" is on #}}
{{ capture greeting -}}
  Hello, {{= user.name }}
{{- endcapture }}

[{{= greeting }}]

{{ with user }}
  {{=- name }} <{{= email }}>
{{- endwith }}

Tags: {{ for tag of user.tags -}}
  {{= tag | upper }}{{= ", " if not loop.last }}
{{- endfor }}

Literal braces: \\{\\{= not_a_tag \\}\\}
`,
      },
    ],
    data: {
      user: {
        name: 'Ada',
        email: 'ada@example.com',
        tags: ['admin', 'staff'],
      },
    },
  },
  {
    id: 'escaping',
    title: { en: 'Escaping', zh: '转义' },
    files: [
      {
        name: 'main',
        content: `<p>Escaped by default: {{= comment }}</p>

<p>Trusted HTML, marked explicitly: {{= trusted | safe }}</p>

<a href="/search?q={{= query | urlencode }}">Search for “{{= query }}”</a>

<div data-settings="{{= settings | json }}"></div>
`,
      },
    ],
    data: {
      comment: '<img src=x onerror="alert(1)">',
      trusted: '<mark>highlighted</mark>',
      query: 'tom & jerry',
      settings: { theme: 'dark', pageSize: 20 },
    },
  },
  {
    id: 'errors',
    title: { en: 'Errors', zh: '错误提示' },
    files: [
      {
        name: 'main',
        content: `{{# This template is broken on purpose. Fix it, or turn on
   "Lenient" to render what can be rendered. #}}
<ul>
{{ for item of items }}
  <li>{{ item.name }}</li>
{{ endfor }}
</ul>

{{ if items | length gt 2 }}
  <p>{{= items | length }} is a lot.</p>
`,
      },
    ],
    data: { items: [{ name: 'one' }, { name: 'two' }, { name: 'three' }] },
  },
];

export const [defaultExample] = examples;
