import { codeToHtml } from './highlighter'

declare global {
  interface Window {
    prettier: any
    prettierPlugins: any
  }
}

function loadScript(url: string) {
  const script = document.createElement('script')

  script.async = true
  script.src = url
  document.querySelector('head')!.prepend(script)
}

function formatCode(code = '', language: string) {
  try {
    return window.prettier.format(code, {
      parser: language === 'javascript' ? 'babel' : 'html',
      plugins: window.prettierPlugins,
    })
  }
  catch {
    return code
  }
}

// Load prettier
[
  'standalone.js',
  'plugins/babel.js',
  'plugins/estree.js',
  'plugins/html.js',
].forEach(url => loadScript(`https://unpkg.com/prettier@3.4.2/${url}`))

const sp = new URLSearchParams(location.search)
const reset = sp.has('reset')

const defaultTemplate
  = (!reset && localStorage.getItem('template'))
    || `{{# This is a comment }}
{{# This is a
comment }}
{{ comment }}
This is a comment with variable "name='{{= name }}'"
{{ endcomment }}
{{ layout "default" }}
{{ include "header" }}
{{ block body }}
  {{ super }}
  <div>
    <h2>{{= name }}</h2>
    <p>Please visit <a href="{{= url }}">Github Repository</a></p>

    <ul>
      {{ for name of array | reverse }}
        <li>
          {{ if name | reverse | lower eq "bob" }}
            ***
          {{ else }}
            {{= name | reverse | lower }}
          {{ endif }}
        </li>
      {{ endfor }}
    </ul>
    ---
    <ul>
      {{ for (x, y) of nested }}
        <li>
        {{= x }} - {{= y }}
        </li>
      {{ endfor }}
    </ul>
  </div>
{{ endblock }}`

const defaultData
  = (!reset && localStorage.getItem('data')) || `{
  "name": "engine",
  "url": "https://github.com/vvenv/jianjia",
  "array": [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve"
  ],
  "nested": [
    {
      "x": "Alice",
      "y": "Eve"
    },
    {
      "x": "Bob",
      "y": "Charlie"
    }
  ]
}
`

const templateEl = document.querySelector<HTMLTextAreaElement>('#template')!
const dataEl = document.querySelector<HTMLTextAreaElement>('#data')!
const resultEl = document.querySelector<HTMLDivElement>('#result')!
const previewEl = document.querySelector<HTMLDivElement>('#preview')!

async function update() {
  try {
    if (!templateEl.value.trim()) {
      templateEl.value = defaultTemplate
    }

    const template = templateEl.value.trim()

    localStorage.setItem('template', template)

    if (!dataEl.value.trim()) {
      dataEl.value = defaultData
    }

    const data = dataEl.value.trim()

    localStorage.setItem('data', data)

    const parsedData = JSON.parse(data)

    const { render } = await import('jianjia')

    const output = await render(template, parsedData, {
      trimWhitespace: true,
    })

    resultEl.innerHTML = await codeToHtml(
      await formatCode(output, 'html'),
      'html',
    )
    previewEl.innerHTML = output
  }
  catch (error: any) {
    resultEl.innerHTML = `<pre class="error">${error.details || error.message}</pre>`
    previewEl.innerHTML = ''
  }
}

update()

templateEl.addEventListener('change', update)
dataEl.addEventListener('change', update)
