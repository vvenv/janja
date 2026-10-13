# Security

## What Janja Protects Against

### Cross-site scripting: output is escaped by default

Everything written with `{{= ... }}` is HTML-escaped (`&`, `<`, `>`, `"`, `'`) unless you opt out.

```javascript
import { render } from 'janja';

await render('{{= input }}', { input: '<script>alert(1)</script>' });
// &lt;script&gt;alert(1)&lt;/script&gt;
```

Opt out per value, for HTML you trust:

```javascript
import { render, Safe } from 'janja';

await render('{{= html }} {{= other | safe }}', {
  html: new Safe('<b>trusted</b>'),
  other: '<i>also trusted</i>',
});
```

Keep `autoEscape: true` (the default). Escaping is for HTML text and quoted attribute values; it does not make a value safe inside `<script>`, inline event handlers, CSS, or unquoted attributes. Use the `json` filter to pass data to scripts and `urlencode` for URL components.

`security.deepEscape: true` changes how arrays and objects are written: instead of their default string form, the escaped values they contain are concatenated.

### Expressions cannot leave the data you give them

Template expressions are not JavaScript. They can read properties of the data and globals you pass, call functions found there, and apply registered filters. They cannot reference JavaScript globals such as `process`, `globalThis` or `require`.

The identifiers `constructor`, `prototype`, `__proto__`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__` and `__lookupSetter__` are rejected at compile time anywhere in an expression, and the built-in `get`, `pick` and `map` filters refuse them as keys. This closes the usual route from a plain object to the `Function` constructor.

### Restricting globals: sandbox mode

`security.sandbox` limits the *renderer-level* `globals` to an allow-list. Data passed to an individual `render()` call is always available.

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  globals: { site, db },
  security: {
    sandbox: true,
    allowedGlobals: ['site'], // `db` is not visible to templates
  },
});
```

`Math`, `Date` and `JSON` are added in sandbox mode.

## What Janja Does Not Protect Against

**Do not render templates written by people you do not trust without additional isolation.** Janja is not a hardened sandbox:

- A template can call any function reachable from the data and globals you pass. If you pass an object with a method that deletes files, a template can call it. Pass plain data.
- Custom filters and plugins run with full privileges.
- There are no CPU or memory limits. A template can loop over a huge collection or recurse through macros until the process runs out of resources.
- `include` loads whatever your `loader` returns for the requested path. If template authors are untrusted, the loader must confine paths itself.

If you must run untrusted templates, do it in a separate process or isolate with resource limits, and pass only JSON-like data.

## Auditing Helper

`renderer.auditTemplate(template)` scans the template text for a few suspicious patterns (`eval(`, `Function(`, `require(`, `import(`). It is a lint-level heuristic, not a security boundary: a clean result does not mean a template is safe.

## Content Security Policy

Janja does not add CSP headers or nonces to your markup. `renderer.getCSPHeaders()` is a small convenience that formats the nonce you configured:

```javascript
const renderer = new Renderer({ security: { cspNonce: nonce } });

renderer.getCSPHeaders();
// { 'Content-Security-Policy': "script-src 'nonce-...'" }
```

Generate a fresh nonce per response, send the header yourself, and pass the nonce to the template as data for your `<script nonce="...">` tags.

## Checklist

- [ ] `autoEscape` is left enabled
- [ ] `safe` / `Safe` are only applied to HTML you produced or sanitized
- [ ] Templates come from your own codebase, or run in an isolated process
- [ ] Data passed to templates is plain data, without powerful methods
- [ ] The `loader` cannot be steered outside the template directory
- [ ] Templates are validated in CI (`validateTemplate`)

## Reporting Security Issues

Please do not open a public issue. Report vulnerabilities privately through GitHub: <https://github.com/vvenv/janja/security/advisories/new>.
