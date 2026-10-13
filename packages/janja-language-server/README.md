# janja-language-server

A [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) server for [Janja](https://github.com/vvenv/janja) templates, for any editor that speaks LSP.

- **Diagnostics** as you type: the syntax errors rendering would report, plus warnings for unknown filters
- **Completions** for directives (with snippets), built-in filters after `|`, and expression keywords
- **Hover** documentation for directives and built-in filters
- **Formatting** of whole documents: normalises the spacing inside tags and never touches the text between them

```bash
npm install -g janja-language-server
```

The server is started by the editor, with the transport on the command line: `janja-language-server --stdio` (also `--node-ipc` and `--socket=<port>`).

## Editor setup

**Neovim** (0.11+):

```lua
vim.filetype.add({ extension = { janja = 'janja' } })
vim.lsp.config('janja', {
  cmd = { 'janja-language-server', '--stdio' },
  filetypes = { 'janja' },
})
vim.lsp.enable('janja')
```

**Helix** (`languages.toml`):

```toml
[language-server.janja]
command = "janja-language-server"
args = ["--stdio"]

[[language]]
name = "janja"
scope = "text.html.janja"
file-types = ["janja"]
language-servers = ["janja"]
```

**VS Code**: use the [Janja extension](../vscode-janja), which provides the same features together with syntax highlighting.

## Programmatic use

```js
import { createConnection } from 'vscode-languageserver/node.js';
import { startServer } from 'janja-language-server';

startServer(createConnection(process.stdin, process.stdout));
```

The editor-independent functions behind the server are exported from `janja-language-server/service`: `getDiagnostics`, `getCompletions`, `getHover` and `formatDocument`.
