# Documentation

## Error Handling

Janja provides comprehensive error handling features to help you debug and validate templates.

### Error Messages with Context

Janja provides detailed error messages with source code highlighting and fix suggestions:

```typescript
import { render, CompileError } from 'janja';

try {
  await render('{{ for }}', {});
} catch (error) {
  if (error instanceof CompileError) {
    console.log(error.details);
    // Output:
    // "for" requires expression
    //
    // 1│ {{ for }}
    //  │ ^       ^
    //
    // Suggestions:
    //   1. The "for" directive requires an expression.
    //      Fix: Add an expression after the for keyword.
    //      Example: for item of items
  }
}
```

### Template Validation

Validate templates without rendering them to catch errors early:

```typescript
import { validateTemplate } from 'janja';

const result = await validateTemplate('Hello {{ name }}');

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  console.warn('Validation warnings:', result.warnings);
} else {
  console.log('Template is valid!');
}
```

### Error Recovery

Configure error recovery to handle runtime errors gracefully:

```typescript
import { createErrorRecovery } from 'janja';

const recovery = createErrorRecovery({
  continueOnError: true,
  undefinedFallback: 'N/A',
  ignoreMissingFilters: true,
  onError: (error, context) => {
    console.error('Template error:', error.message);
    console.error('Context:', context);
  },
});

// Use with safe accessor
const accessor = recovery.createSafeAccessor({ name: 'John' });
console.log(accessor('name')); // 'John'
console.log(accessor('age')); // 'N/A' (undefined fallback)
```

### Common Error Messages

- **"Unclosed marker"**: A template marker ({{, {%, {#) is not properly closed
- **"Expected expression"**: A directive requires an expression but none was provided
- **"Filter not defined"**: A filter used in the template is not registered
- **"Unexpected token"**: The parser encountered an unexpected token in the template

## Built-in Directives

### **include**: Template Inheritance & Inclusion

```janja
{{ include "template" }}
```

### **if / elif / else**: Conditional Statements

```janja
{{ if condition }}Content{{ elif other }}Content{{ else }}Content{{ endif }}
```

### **for**: Looping

```janja
{{ for item of array_items }}{{= item }}{{ endfor }}
```

```janja
{{ for item of object_items | values }}{{= item }}{{ endfor }}
```

### **set**: Variable Assignment

```janja
{{ set foo = 123 }}
{{ set (a, b) = obj }}
{{ set foo }}Content{{ endset }}
```

### **block / super**: Block Overriding & Inheritance

Blocks with the same name will automatically overwrite or inherit, and blocks are always rendered where they first appear.

```janja
{{ block title }}{{ super }}Default Title{{ endblock }}
```

### **macro / caller**: Macro Definition & Invocation

```janja
{{ macro my_macro(x, y) }}Content{{ caller }}{{ endmacro }}
```

### **call**: Macro Invocation

```janja
{{ call my_macro("foo", "bar") }}Content{{ endcall }}
```

### **break / continue**: Loop Control

```janja
{{ break }}
{{ continue }}
```

### **comment**: Comments

```janja
{{# This is a comment #}}
```

### **expression (=)**: Expression Output

```janja
{{= foo | upper }}
{{= a if cond else b }}
```

## Built-in Filters

abs, capitalize, add, ceil, compact, div, entries, even, fallback, first, get, groupby, join, json, keys, last, length, lower, map, max, min, mul, odd, omit, pick, repeat, replace, reverse, safe, slice, sort, split, sub, sum, trim, truncate, unique, upper, urldecode, urlencode, values

### Date/Time Filters

- **date**: Format dates
- **timeAgo**: Display relative time

### Number Formatting Filters

- **round**: Round numbers
- **fixed**: Format numbers with fixed decimal places
- **percent**: Format numbers as percentages
- **currency**: Format numbers as currency

### Text Processing Filters

- **wordCount**: Count words in text
- **stripTags**: Remove HTML tags
- **slugify**: Convert text to URL-friendly slugs

### Array Manipulation Filters

- **shuffle**: Randomly shuffle array elements
- **chunk**: Split array into chunks
- **pluck**: Extract property values from array of objects

### Object Transformation Filters

- **defaults**: Set default values for missing properties
- **invert**: Invert object keys and values
- **merge**: Merge multiple objects

### Async Filters

- **fetchUrl**: Fetch data from a URL (async)
- **delay**: Add delay (async)

### Examples

```janja
{{= foo | upper }}
{{= list | join(",") }}
{{= obj | keys }}
{{= arr | groupby(key_name) }}
```

## CLI Tool

Janja provides a CLI tool for pre-compiling templates to improve performance in production.

### Installation

```bash
pnpm add -g janja-cli
```

### Compile Command

Compile a single template file:

```bash
janja compile template.janja ./compiled
```

Compile templates in a directory:

```bash
janja compile ./templates ./compiled
```

Options:
- `-w, --watch`: Watch for file changes and recompile
- `-r, --recursive`: Recursively compile templates in directory

### Watch Command

Watch templates for changes and automatically recompile:

```bash
janja watch ./templates ./compiled
```

Options:
- `-r, --recursive`: Recursively watch templates in directory

### Example

```bash
# Compile all templates
janja compile ./src/templates ./dist/templates

# Watch for changes during development
janja watch ./src/templates ./dist/templates
```

## API Reference

### render()

Render a template string with data:

```typescript
import { render } from 'janja';

const result = await render('Hello {{ name }}!', { name: 'World' });
// Output: "Hello World!"
```

### renderFile()

Render a template file with data:

```typescript
import { renderFile } from 'janja';

const result = await renderFile('./template.janja', { name: 'World' });
```

### Renderer Options

Configure the renderer with options:

```typescript
import { render } from 'janja';

const result = await render('Hello {{ name }}!', { name: 'World' }, {
  globals: { siteName: 'My Site' },
  autoEscape: true,
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 3600,
  },
  security: {
    sandbox: true,
  },
});
```

### validateTemplate()

Validate a template without rendering:

```typescript
import { validateTemplate } from 'janja';

const result = await validateTemplate('Hello {{ name }}');
console.log(result.valid); // true
console.log(result.errors); // []
console.log(result.warnings); // []
```

### createErrorRecovery()

Create an error recovery instance for graceful error handling:

```typescript
import { createErrorRecovery } from 'janja';

const recovery = createErrorRecovery({
  continueOnError: true,
  undefinedFallback: '',
  ignoreMissingFilters: false,
  onError: (error, context) => {
    // Custom error handling
  },
});
```

## Customization

### Custom Directive

```typescript
class CustomNode extends Traversal {
  readonly type = 'CUSTOM'
  constructor(public readonly loc: Loc) {
    super();
  }
}
render('{{ custom }}', {}, {
  parsers: {
    async *custom(token) {
      yield 'NEXT';
      yield new CustomNode(token.loc);
    },
  },
  compilers: {
    CUSTOM: async (node, compiler) => {
      compiler.pushStr(node.loc, '<CUSTOM/>')
    },
  },
})
```

### Custom Filter

```javascript
const engine = new Engine({
  filters: {
    my_filter(value) {
      return `Custom: ${value}`
    },
  },
})
```

Usage in template:

```janja
{{= foo | my_filter }}
```

---

## Best Practices

### 1. Use Template Validation

Always validate your templates in development to catch errors early:

```typescript
import { validateTemplate } from 'janja';

// In your build process
async function validateAllTemplates() {
  const templates = glob.sync('**/*.janja');
  for (const template of templates) {
    const content = fs.readFileSync(template, 'utf-8');
    const result = await validateTemplate(content);
    if (!result.valid) {
      console.error(`Errors in ${template}:`, result.errors);
    }
  }
}
```

### 2. Enable Caching in Production

Enable template caching for better performance:

```typescript
import { render } from 'janja';

const result = await render(template, data, {
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600, // 1 hour
  },
});
```

### 3. Use Pre-compilation

Pre-compile templates for production builds:

```bash
# Build step
janja compile ./templates ./dist/templates --recursive
```

### 4. Secure Your Templates

Enable sandbox mode for untrusted templates:

```typescript
import { render } from 'janja';

const result = await render(userTemplate, data, {
  security: {
    sandbox: true,
    allowedGlobals: ['Math', 'Date'],
  },
});
```

### 5. Handle Errors Gracefully

Use error recovery for production applications:

```typescript
import { createErrorRecovery } from 'janja';

const recovery = createErrorRecovery({
  continueOnError: true,
  undefinedFallback: '',
  onError: (error) => {
    // Log to error tracking service
    trackError(error);
  },
});
```

### 6. Organize Templates with Blocks

Use template inheritance to avoid duplication:

```janja
<!-- base.janja -->
<!DOCTYPE html>
<html>
<head>
  {{ block head }}<title>Default Title</title>{{ endblock }}
</head>
<body>
  {{ block content }}Default content{{ endblock }}
</body>
</html>

<!-- page.janja -->
{{ include "base.janja" }}
{{ block head }}<title>My Page</title>{{ endblock }}
{{ block content }}<h1>My Content</h1>{{ endblock }}
```

## Troubleshooting

### Template Not Rendering

**Problem**: Template renders as empty string or shows raw template syntax.

**Solution**:
- Check that you're using `{{=` for output, not just `{{`
- Verify the template syntax is valid using `validateTemplate()`
- Check for unclosed markers using the validator

### Variables Not Showing

**Problem**: Variables in template show as empty or undefined.

**Solution**:
- Verify the data object is passed correctly
- Check variable names match exactly (case-sensitive)
- Use error recovery with `undefinedFallback` to handle missing values
- Check the data structure matches the template expectations

### Performance Issues

**Problem**: Template rendering is slow.

**Solution**:
- Enable template caching
- Use pre-compilation for production
- Minimize complex expressions in templates
- Use filters efficiently (avoid chaining too many)

### Security Concerns

**Problem**: Worried about XSS or code injection.

**Solution**:
- Enable `autoEscape` (default: true)
- Use sandbox mode for untrusted templates
- Validate user input before passing to templates
- Use the `safe` filter only when necessary

For more details, refer to the source code in `packages/janja/src/filters.ts` and `packages/janja/src/plugins/`.
