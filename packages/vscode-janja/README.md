# Janja for VS Code

Language support for [Janja](https://github.com/vvenv/janja) templates (`.janja` files).

- **Syntax highlighting** for output tags, directives, comments and expressions, embedded in HTML
- **Diagnostics** as you type: the same syntax errors rendering would report, plus warnings for unknown filters
- **Completions** for directives (with snippets for block directives), built-in filters after `|`, and expression keywords
- **Hover** documentation for directives and built-in filters
- **Formatting** (Format Document): normalises the spacing inside tags and leaves the text between them untouched
- Bracket matching, auto-closing of `{{ }}`, block comments with `{{# #}}`, and indentation of block directives

To use it for `.html` files as well, add to your settings:

```json
{ "files.associations": { "*.html": "janja" } }
```

## Development

```bash
pnpm --filter vscode-janja build
```

Then open this directory in VS Code and press F5 to launch an Extension Development Host. `pnpm --filter vscode-janja package` writes `janja.vsix`, which *Extensions: Install from VSIX...* installs (the build bundles everything the extension needs).

Releases are published by the `VS Code extension` workflow: it attaches the `.vsix` to the GitHub release, and publishes to the Visual Studio Marketplace and Open VSX when the `VSCE_PAT` and `OVSX_PAT` repository secrets are set.

The editor features come from [`janja-language-server`](../janja-language-server), which other editors can use over LSP.
