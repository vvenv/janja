# Security Best Practices for Janja

This document outlines security best practices for using the Janja template engine safely in production environments.

## Overview

Janja provides several security features to help you build secure applications. However, proper configuration and usage are essential to maintain security.

## Core Security Features

### 1. Auto-Escaping

Janja automatically escapes HTML output by default to prevent XSS (Cross-Site Scripting) attacks.

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({ autoEscape: true }); // Default
const result = await renderer.render('{{= user_input }}', {
  user_input: '<script>alert("XSS")</script>',
});
// Output: &lt;script&gt;alert("XSS")&lt;/script&gt;
```

**Best Practice:** Always keep `autoEscape: true` unless you have a specific reason to disable it.

### 2. Sandbox Mode

Enable sandbox mode to restrict access to dangerous globals and functions in template execution.

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  security: {
    sandbox: true,
    allowedGlobals: ['Math', 'Date', 'JSON'],
  },
});
```

**Best Practice:** Use sandbox mode in production, especially when rendering user-provided templates.

### 3. Deep Escaping

Enable deep escaping to recursively escape objects and arrays.

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  security: {
    deepEscape: true,
  },
});
```

**Best Practice:** Enable deep escaping when your data contains nested objects or arrays that may include user input.

### 4. Content Security Policy (CSP)

Use CSP headers to restrict resource loading and prevent injection attacks.

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  security: {
    cspNonce: 'random-nonce-value',
  },
});

// Get CSP headers
const headers = renderer.getCSPHeaders();
// Headers: { 'Content-Security-Policy': "script-src 'nonce-random-nonce-value'" }
```

**Best Practice:** Always use CSP with nonces when rendering HTML in web applications.

### 5. Security Auditing

Audit templates before rendering to detect potential security issues.

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer();
const auditResult = renderer.auditTemplate(template);

if (auditResult.severity === 'critical') {
  console.error('Critical security issues found:', auditResult.issues);
  // Handle accordingly
}
```

**Best Practice:** Audit all user-provided templates before rendering them in production.

## Security Configuration Examples

### Production Configuration

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  autoEscape: true,
  security: {
    sandbox: true,
    allowedGlobals: ['Math', 'Date', 'JSON'],
    deepEscape: true,
    cspNonce: generateSecureNonce(),
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600000, // 1 hour
  },
});
```

### Development Configuration

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  autoEscape: true,
  security: {
    sandbox: false, // Disabled for easier debugging
    deepEscape: false,
  },
  cache: {
    enabled: false, // Disabled to see changes immediately
  },
});
```

## Common Security Pitfalls

### ❌ Don't: Disable Auto-Escaping

```javascript
const renderer = new Renderer({ autoEscape: false });
```

**Risk:** XSS vulnerabilities if user input contains malicious scripts.

### ✅ Do: Use Safe Strings for Trusted Content

```javascript
import { Safe } from 'janja';

const renderer = new Renderer({ autoEscape: true });
const result = await renderer.render('{{= content }}', {
  content: new Safe('<div>Trusted HTML</div>'),
});
```

### ❌ Don't: Pass Dangerous Globals

```javascript
const renderer = new Renderer({
  security: {
    sandbox: true,
    allowedGlobals: ['process', 'require'], // Dangerous!
  },
});
```

**Risk:** Templates can access Node.js internals and execute arbitrary code.

### ✅ Do: Whitelist Safe Globals Only

```javascript
const renderer = new Renderer({
  security: {
    sandbox: true,
    allowedGlobals: ['Math', 'Date', 'JSON'],
  },
});
```

### ❌ Don't: Render User-Provided Templates Without Auditing

```javascript
const userTemplate = req.body.template;
const result = await renderer.render(userTemplate, data);
```

**Risk:** Users can inject malicious code into templates.

### ✅ Do: Audit Before Rendering

```javascript
const userTemplate = req.body.template;
const auditResult = renderer.auditTemplate(userTemplate);

if (auditResult.severity !== 'low') {
  throw new Error('Template contains security issues');
}

const result = await renderer.render(userTemplate, data);
```

## Security Checklist

Before deploying to production:

- [ ] Auto-escaping is enabled (`autoEscape: true`)
- [ ] Sandbox mode is enabled for user-provided templates
- [ ] Allowed globals are whitelisted and minimal
- [ ] Deep escaping is enabled for complex data structures
- [ ] CSP headers are configured with nonces
- [ ] All user-provided templates are audited before rendering
- [ ] Cache is configured with appropriate TTL
- [ ] Security audit tool is integrated into CI/CD pipeline

## Reporting Security Issues

If you discover a security vulnerability in Janja, please report it responsibly:

1. Do not create a public issue
2. Email security@janja.dev with details
3. Include steps to reproduce the vulnerability
4. Allow time for the issue to be fixed before disclosing

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
