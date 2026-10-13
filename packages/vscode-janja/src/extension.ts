import {
  formatDocument,
  getCompletions,
  getDiagnostics,
  getHover,
} from 'janja-language-server/service';
import * as vscode from 'vscode';

const kinds = {
  directive: vscode.CompletionItemKind.Keyword,
  keyword: vscode.CompletionItemKind.Operator,
  filter: vscode.CompletionItemKind.Function,
};

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection('janja');
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const check = async (document: vscode.TextDocument) => {
    if (document.languageId !== 'janja') {
      return;
    }

    const { version } = document;
    const found = await getDiagnostics(document.getText());

    // The document may have changed while it was being checked
    if (document.version !== version) {
      return;
    }

    diagnostics.set(
      document.uri,
      found.map(({ severity, message, line, column, length }) => {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(line, column, line, column + length),
          message,
          severity === 'error'
            ? vscode.DiagnosticSeverity.Error
            : vscode.DiagnosticSeverity.Warning,
        );

        diagnostic.source = 'janja';

        return diagnostic;
      }),
    );
  };

  // Checked shortly after the last keystroke rather than on each one
  const schedule = (document: vscode.TextDocument) => {
    const key = document.uri.toString();

    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => void check(document), 200),
    );
  };

  vscode.workspace.textDocuments.forEach((document) => void check(document));

  context.subscriptions.push(
    diagnostics,
    vscode.workspace.onDidOpenTextDocument((document) => void check(document)),
    vscode.workspace.onDidChangeTextDocument(({ document }) =>
      schedule(document),
    ),
    vscode.workspace.onDidCloseTextDocument((document) => {
      clearTimeout(timers.get(document.uri.toString()));
      diagnostics.delete(document.uri);
    }),
    vscode.languages.registerCompletionItemProvider(
      'janja',
      {
        provideCompletionItems(document, position) {
          return getCompletions(
            document.getText(),
            document.offsetAt(position),
          ).map(({ label, kind, detail, snippet }) => {
            const item = new vscode.CompletionItem(label, kinds[kind]);

            item.detail = detail;

            if (snippet) {
              item.insertText = new vscode.SnippetString(snippet);
            }

            return item;
          });
        },
      },
      '|',
      ' ',
      '{',
    ),
    vscode.languages.registerHoverProvider('janja', {
      provideHover(document, position) {
        const hover = getHover(document.getText(), document.offsetAt(position));

        return (
          hover &&
          new vscode.Hover(
            new vscode.MarkdownString(hover.contents),
            new vscode.Range(
              document.positionAt(hover.start),
              document.positionAt(hover.end),
            ),
          )
        );
      },
    }),
    vscode.languages.registerDocumentFormattingEditProvider('janja', {
      provideDocumentFormattingEdits(document) {
        const formatted = formatDocument(document.getText());

        return formatted === null
          ? []
          : [
              vscode.TextEdit.replace(
                new vscode.Range(
                  document.positionAt(0),
                  document.positionAt(document.getText().length),
                ),
                formatted,
              ),
            ];
      },
    }),
  );
}

export function deactivate() {}
