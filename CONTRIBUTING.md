# Contributing

## Setup

Requires Node.js 20 or later and [pnpm](https://pnpm.io) (the version is pinned in `package.json`; `corepack enable` picks it up).

```bash
pnpm install
pnpm build      # build all packages (the ESLint config needs the built plugin)
```

## Everyday Commands

```bash
pnpm test       # all packages
pnpm typecheck  # all packages
pnpm lint
pnpm bench      # benchmarks, including the comparison with other engines
pnpm --filter janja dev   # tests in watch mode
node packages/janja/scripts/smoke.mjs   # check the built entry points
```

## Layout

- `packages/janja` – the template engine
  - `src/tokenizer.ts`, `src/parser.ts`, `src/compiler.ts`, `src/renderer.ts` – the pipeline from template text to output
  - `src/exp/` – the expression language
  - `src/plugins/` – one directory per directive (parser, compiler, syntax node, tests)
- `packages/janja-cli` – the `janja` command for pre-compiling templates
- `packages/eslint-plugin-janja` – ESLint rules for template formatting
- `packages/vite-plugin-janja` – Vite and Rollup plugin
- `packages/janja-express`, `packages/janja-koa`, `packages/janja-fastify` – server framework integrations
- `packages/janja-language-server` – LSP server; its `service` module holds the editor features
- `packages/vscode-janja` – VS Code extension (not published to npm)
- `SPEC.md` and `spec/conformance.json` – the language definition and its executable test cases

## Guidelines

- Add a test for every behaviour change; a bug fix starts with a test that fails without it.
- A change to the language itself goes into `SPEC.md` and gets cases in `spec/conformance.json`.
- Malformed templates must never hang or crash the process. If you touch the tokenizer or a parser, run the fuzz test in `src/validator.test.ts`.
- Anything that widens what template expressions can reach needs a look at [SECURITY.md](./SECURITY.md) first.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org); releases and changelogs are generated from them. Mark breaking changes with `!` (`feat!: ...`).
