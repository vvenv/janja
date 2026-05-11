# Performance Optimization Guide

## Overview

Janja is designed for high performance template rendering. This guide provides best practices and techniques to optimize your template rendering performance.

## Performance Characteristics

### Compilation vs Rendering

- **Compilation**: One-time cost to parse and compile the template into executable code
- **Rendering**: Repeated cost of executing the compiled template with data

**Best Practice**: Enable caching to avoid re-compiling the same template multiple times.

```typescript
import { render } from 'janja';

const result = await render(template, data, {
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600,
  },
});
```

### Pre-compilation

For production deployments, pre-compile your templates to avoid compilation overhead at runtime.

```bash
# Pre-compile templates
janja compile ./templates ./dist/templates --recursive
```

## Optimization Techniques

### 1. Use Template Caching

Enable caching in production to store compiled templates:

```typescript
const options = {
  cache: {
    enabled: true,
    maxSize: 1000, // Maximum number of cached templates
    ttl: 3600, // Time-to-live in seconds
  },
};
```

### 2. Minimize Complex Expressions

Complex expressions in templates can slow down rendering. Pre-compute values in your data:

**Bad:**
```janja
{{= (a + b) * (c - d) / e }}
```

**Good:**
```typescript
const data = { result: (a + b) * (c - d) / e };
```
```janja
{{= result }}
```

### 3. Optimize Filter Usage

Filter chains add overhead. Use them efficiently:

**Bad:**
```janja
{{= text | upper | lower | upper | truncate(100) }}
```

**Good:**
```janja
{{= text | truncate(100) | upper }}
```

### 4. Use Loops Efficiently

Large loops can impact performance. Consider pagination or limiting data:

```janja
{{ for item of items | slice(0, 50) }}
  {{= item.name }}
{{ endfor }}
```

### 5. Avoid Deep Nesting

Deeply nested templates are harder to optimize:

**Bad:**
```janja
{{ for user of users }}
  {{ for post of user.posts }}
    {{ for comment of post.comments }}
      {{= comment.text }}
    {{ endfor }}
  {{ endfor }}
{{ endfor }}
```

**Good:** Pre-process data or use component-based approach.

### 6. Use Block Inheritance

Avoid template duplication with block inheritance:

```janja
<!-- base.janja -->
{{ block content }}{{ endblock }}

<!-- page.janja -->
{{ include "base.janja" }}
{{ block content }}Page content{{ endblock }}
```

## Performance Benchmarks

### Simple Template
- Template: `Hello {{ name }}!`
- Data: `{ name: 'World' }`
- Performance: < 1ms per render

### Complex Template
- Template with loops, filters, conditionals
- Data: Array of 100 items
- Performance: < 10ms per render

### Escape Operations
- Simple string: < 0.01ms per escape
- String with special chars: < 0.02ms per escape
- Long string (2000+ chars): < 0.05ms per escape

## Monitoring Performance

### Using Benchmark Suite

Run the benchmark suite to measure performance:

```bash
pnpm --filter janja test benchmarks
```

### Performance Regression CI

The CI workflow automatically runs benchmarks on every PR and alerts if performance degrades by more than 200%.

## Performance Targets

- **Simple template render**: < 1ms
- **Complex template render**: < 10ms
- **Template compilation**: < 5ms (first time)
- **Cached template render**: < 0.5ms
- **Escape operation**: < 0.02ms
- **Filter application**: < 0.05ms

## Troubleshooting Performance Issues

### Slow First Render

**Cause**: Template compilation overhead

**Solution**: Enable caching or use pre-compilation

### Memory Usage High

**Cause**: Large cache size or large data objects

**Solution**: Reduce cache size or implement data pagination

### Rendering Gets Slower Over Time

**Cause**: Cache not configured properly or memory leak

**Solution**: Check cache configuration and TTL settings

### Large Template Slow to Render

**Cause**: Complex template with many operations

**Solution**: Split into smaller components or pre-process data

## Advanced Techniques

### Custom Compilers

For maximum performance, create custom compilers for specific use cases:

```typescript
const options = {
  compilers: {
    CUSTOM: async (node, compiler) => {
      // Optimized compilation for custom nodes
    },
  },
};
```

### Streaming for Large Templates

For very large templates, consider streaming the output:

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer(options);
const stream = await renderer.renderStream(template, data);
```

## Profile Your Templates

Use browser dev tools or Node.js profiler to identify bottlenecks:

```bash
node --prof your-app.js
node --prof-process isolate-*.log > profile.txt
```

## Conclusion

By following these optimization techniques and best practices, you can achieve excellent performance with Janja template rendering. Always measure performance in your specific use case and optimize based on actual bottlenecks.
