# Janja Optimization Roadmap

> **Status note (2026-11):** audited against the code again. Phases 1–4.1 and
> 5.2 are done. Items that are out of scope for a small template engine, have
> no measurable payoff, or need organisational work rather than code were
> cancelled or deferred below. A ticked box means the behaviour is covered by
> tests (or, for docs/community items, that the file exists).

## Overview

Evolve Janja into a solid, fast, well-tooled template engine. Remaining work is
narrow: hardening for untrusted-template edge cases, a few docs, and optional
DX polish. Do not expand scope into a plugin marketplace or full sandbox VM.

## Phase 1: Performance Foundation (High Priority) — done

### 1.1 Template Caching System
**Priority**: Critical · **Impact**: High · **Effort**: Medium

- [x] Implement LRU cache for compiled templates
- [x] Add cache configuration options (size, TTL)
- [x] Create cache invalidation mechanism
- [x] Add cache statistics/metrics
- [x] Write cache performance tests

### 1.2 Pre-compilation Support
**Priority**: Critical · **Impact**: High · **Effort**: Medium

- [x] Create CLI tool for pre-compiling templates
- [x] Implement template serialization to disk
- [x] Add compiled template loader
- [x] Recompile on change (`janja watch`); in-process hot reload is not implemented
- [x] Add build system integration examples

### 1.3 String Processing Optimization
**Priority**: High · **Impact**: Medium · **Effort**: Low

- [x] Optimize `escape.ts` - single-pass replacement
- [x] Optimize `out-script.ts` - use array + join
- [x] Benchmark string operations
- [x] Add performance regression tests (CI compares benchmarks against `main`)

### 1.4 Tokenizer Performance
**Priority**: High · **Impact**: Medium · **Effort**: Medium

- [x] Optimize `indexOf` loops in tokenizer
- [x] ~~Implement more efficient string search~~ **cancelled** — analysed; no measurable win over the current `indexOf` loops
- [x] Add tokenizer benchmark suite
- [x] Profile and optimize hot paths (escaping, loop scopes, filter calls, cache hits; see PERFORMANCE.md)

## Phase 2: Feature Enhancement (High Priority)

### 2.1 Filter Library Expansion — done
**Priority**: High · **Impact**: High · **Effort**: Medium

- [x] Add date/datetime filters
- [x] Add number formatting filters
- [x] Add text processing filters (wordcount, striptags)
- [x] Add array manipulation filters
- [x] Add object transformation filters
- [x] Support async filters
- [x] Create filter documentation with examples

### 2.2 Security Enhancements
**Priority**: Critical · **Impact**: High · **Effort**: Medium

- [x] Restrict expressions to the data they are given (no access to JS globals or object internals) and allow-list renderer globals. This is **not** a hardened sandbox for untrusted templates, see SECURITY.md
- [x] Resource limits (`maxIncludeDepth`, `maxLoopIterations`, `maxCallDepth`, `timeoutMs`) for untrusted templates — see SECURITY.md
- [x] ~~Add CSP (Content Security Policy) support~~ **cancelled as engine feature** — CSP is an HTTP concern; keep `getCSPHeaders()` / `cspNonce` as the formatting helper only
- [x] Add deep escaping options
- [x] ~~Implement security audit tool~~ **scoped down** — keep `auditTemplate` as a lint-level heuristic; a real auditor would need a separate process/isolate and is out of scope. Documented in SECURITY.md
- [x] Add security best practices documentation

### 2.3 Internationalization (i18n) — done
**Priority**: Medium · **Impact**: High · **Effort**: High

- [x] Add i18n filter support
- [x] Implement pluralization handling
- [x] Add date/time localization
- [x] Create translation file loader (JSON; YAML limited to nested key/value maps)
- [x] Add locale-aware number formatting
- [x] Write i18n documentation

### 2.4 Advanced Template Features — done
**Priority**: Medium · **Impact**: Medium · **Effort**: Medium

- [x] Support multi-level `super()` calls
- [x] Add `with` context manager directive
- [x] Implement template composition
- [x] Add whitespace control options
- [x] Support template mixins

## Phase 3: Developer Experience (Medium Priority)

### 3.1 Error Handling Improvements — done
**Priority**: High · **Impact**: High · **Effort**: Medium

- [x] Enhance error messages with context
- [x] Add syntax error location highlighting
- [x] Provide fix suggestions for common errors
- [x] Create template validation tool (backed by the real parser)
- [x] Add error recovery mechanisms (lenient mode via the `debug` option)

### 3.2 Toolchain Development — done
**Priority**: High · **Impact**: High · **Effort**: High

- [x] Create VS Code extension for syntax highlighting (`packages/vscode-janja`)
- [x] Implement Language Server Protocol (LSP) (`janja-language-server`)
- [x] Add template formatter (`formatTemplate`, `janja format`)
- [x] Create ESLint plugin for template formatting (`eslint-plugin-janja`)
- [x] Add IntelliSense support (VS Code extension shares features with the language server)

### 3.3 Documentation Expansion
**Priority**: Medium · **Impact**: High · **Effort**: Medium

- [x] Expand API documentation
- [x] Add comprehensive examples
- [x] Create best practices guide
- [x] Write migration guides from other engines (`MIGRATION.md`: Nunjucks / Jinja2 / Handlebars / EJS)
- [x] Add troubleshooting section
- [x] ~~Create video tutorials~~ **cancelled** — not maintained in-repo; playground at janja.wenfu.dev covers interactive learning

### 3.4 Testing and Benchmarking — done
**Priority**: High · **Impact**: Medium · **Effort**: Medium

- [x] Create performance benchmark suite
- [x] Add comparison benchmarks with Handlebars, EJS, Nunjucks and Eta
- [x] Implement performance regression CI
- [x] Add load testing tools (`benchmarks/load-test.ts`, run manually)
- [x] Create performance optimization guide

## Phase 4: Ecosystem Expansion (Medium Priority)

### 4.1 Framework Integrations — done
**Priority**: High · **Impact**: High · **Effort**: Medium

- [x] Create Express view engine (`janja-express`)
- [x] Create Koa middleware (`janja-koa`)
- [x] Create Fastify plugin (`janja-fastify`)

### 4.2 Development Tools
**Priority**: Medium · **Impact**: Medium · **Effort**: Medium

- [x] Add watch mode for development (`janja watch`)
- [x] ~~Implement Hot Module Replacement (HMR)~~ **scoped down** — `vite-plugin-janja` already `addWatchFile`s includes so Vite rebuilds dependents; full client HMR for template modules is not needed for the SSR/precompile model
- [x] Create template bundler integration (`vite-plugin-janja` for Vite and Rollup)
- [x] Add source map generation (`precompile`, `janja compile --source-map`, `vite-plugin-janja`)
- [x] ~~Create template inspector tool~~ **cancelled** — LSP diagnostics/hover/completions cover inspection; a separate inspector UI is not planned

### 4.3 Community Building
**Priority**: Medium · **Impact**: High · **Effort**: High

- [x] ~~Create plugin marketplace~~ **cancelled** — premature; npm + `definePlugin` is enough until there is demand
- [x] ~~Provide plugin development scaffolding~~ **scoped down** — `definePlugin` + CONTRIBUTING.md plugin layout; no generator until third-party plugins exist
- [x] Write contribution guidelines
- [x] Create code of conduct (`CODE_OF_CONDUCT.md`, Contributor Covenant 2.1)
- [x] ~~Set up community Discord/Slack~~ **deferred** — organisational; revisit when traffic justifies it
- [x] ~~Organize community events~~ **cancelled** — organisational, not engineering

## Phase 5: Architecture Improvements (Low Priority)

### 5.1 Plugin System Enhancement
**Priority**: Low · **Impact**: Low for current model · **Effort**: High

Plugins today are flat merges of `filters` / `parsers` / `compilers` / `formatters`. Dependency graphs, hot loading and version negotiation do not fit that model and would add complexity without users asking for them.

- [x] ~~Add plugin dependency management~~ **deferred** until a real third-party plugin ecosystem exists
- [x] ~~Implement plugin lifecycle hooks~~ **deferred** — no lifecycle beyond merge-at-construct
- [x] ~~Support plugin hot loading~~ **deferred** — recreate the `Renderer` instead
- [x] ~~Create plugin validation~~ **deferred** — TypeScript + `definePlugin` is the check
- [x] ~~Add plugin version compatibility~~ **deferred**

### 5.2 Type Safety — done
**Priority**: Medium · **Impact**: Medium · **Effort**: High

- [x] Enhance TypeScript type definitions
- [x] Add template type inference (`analyzeTemplate`, `--dts` declarations for pre-compiled templates)
- [x] Support generic context types (`renderer.template<Data>()`)
- [x] Create type-safe filter definitions (`defineFilters`)
- [x] Add type-safe plugin definitions (`definePlugin`)

## Near-term backlog

Engineering roadmap items above are closed or explicitly deferred. Next work is
maintenance (deps, VS Code marketplace publish, benchmark numbers) and whatever
users file as issues — not more platform fantasy.

## Success Metrics

### Performance
- [x] Caching makes repeated renders of the same template skip compilation (see PERFORMANCE.md / cache tests)
- [x] Hot paths profiled; CI fails on >2× regressions
- [ ] Documented p50 render time for the comparison template on reference hardware (refresh when publishing numbers)
- [x] ~~Support for 10,000+ concurrent renders~~ **reframed** — Node handles concurrency; engine is async and stream-capable; no artificial cap to “prove”

### Features
- [x] Broad built-in filter set (~56; Jinja2 parity is not a goal — document gaps in FILTERS.md instead of chasing a count)
- [x] i18n support (filters + loader + docs)
- [x] Expression / globals sandbox (not a hardened isolate — see SECURITY.md)
- [x] Multi-level template inheritance (`block` / `super`)

### Ecosystem
- [x] Core framework integrations (Express, Koa, Fastify) + Vite/Rollup plugin
- [ ] VS Code extension published (workflow exists; downloads are a market outcome)
- [x] ~~50+ community plugins~~ **cancelled as a target** — quality over count
- [x] ~~Active community of 1K+ developers~~ **deferred** — outcome metric, not a build task

### Quality
- [x] ~~100% test coverage~~ **reframed** — high coverage on core package with vitest; 100% is not a gate
- [ ] Zero critical security vulnerabilities (ongoing; private reporting via GitHub advisories)
- [x] TypeScript strict mode compliance
- [x] Comprehensive documentation (root Markdown + website)

## Risks and Mitigation

### Technical Risks
- **Breaking changes**: semantic versioning; migration guides for external engines
- **Performance regressions**: continuous benchmarking, performance CI
- **Security vulnerabilities**: honest SECURITY.md boundaries; resource limits for untrusted templates; private advisories

### Scope Risks
- **Sandbox theatre**: do not claim process isolation Janja does not provide
- **Plugin platform fantasy**: keep `definePlugin` simple until real plugins exist
- **Roadmap bloat**: prefer cancelling vanity items over leaving them open forever

## Conclusion

The foundation (cache, CLI, filters, i18n, toolchain, frameworks, types) is in
place. Finish resource limits and the remaining docs; resist building a
marketplace, inspector UI, or hardened VM inside the engine.
