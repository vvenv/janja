# eslint-plugin-janja

ESLint plugin for [Janja](https://github.com/vvenv/janja) template formatting and linting.

## Installation

```bash
npm install --save-dev eslint-plugin-janja
```

## Usage

Add `janja` to the plugins section of your ESLint configuration file:

```javascript
// eslint.config.js
import janjaPlugin from 'eslint-plugin-janja';

export default [
  {
    plugins: {
      janja: janjaPlugin,
    },
    rules: {
      'janja/spacing': 'error',
    },
  },
];
```

Or use the recommended configuration:

```javascript
// eslint.config.js
import janjaPlugin from 'eslint-plugin-janja';

export default [
  {
    plugins: {
      janja: janjaPlugin,
    },
    rules: janjaPlugin.configs.recommended.rules,
  },
];
```

## Rules

### `janja/spacing`

Enforce consistent spacing in Janja template expressions.

**✅ Correct:**
```janja
{{= x }}
{{- x -}}
{{ for item of items }}
```

**❌ Incorrect:**
```janja
{{=x}}
{{-x-}}
{{for item of items}}
```

#### Options

```javascript
{
  "janja/spacing": ["error", "never" | "always" ]
}
```

## Auto-fix

This plugin supports ESLint's `--fix` option to automatically format template expressions:

```bash
eslint --fix your-file.janja
```

## Examples

### With default tags `{{` and `}}`

```janja
// Before
{{=name}}

// After auto-fix
{{= name }}
```

### With custom tags `<%` and `%>`

```javascript
export default [
  {
    plugins: {
      janja: janjaPlugin,
    },
    languageOptions: {
      outputOpen: '<%=',
      outputClose: '%>',
      directiveOpen: '<%',
      directiveClose: '%>',
    },
    rules: {
      'janja/spacing': 'error',
    },
  },
];
```

```janja
// Before
<%=name%>

// After auto-fix
<%= name %>
```

## Architecture

This plugin uses Janja's built-in `Tokenizer` to parse template expressions, ensuring consistent behavior with the Janja template engine itself.

## License

MIT
