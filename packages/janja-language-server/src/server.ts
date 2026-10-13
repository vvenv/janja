import {
  type CompletionItem,
  CompletionItemKind,
  type Connection,
  type Diagnostic,
  DiagnosticSeverity,
  InsertTextFormat,
  MarkupKind,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  formatDocument,
  getCompletions,
  getDiagnostics,
  getHover,
} from './service.js';

export * from './service.js';

const completionKinds = {
  directive: CompletionItemKind.Keyword,
  keyword: CompletionItemKind.Operator,
  filter: CompletionItemKind.Function,
};

/**
 * Serve the Language Server Protocol on a connection: diagnostics as
 * documents change, completions, hover and whole-document formatting.
 */
export function startServer(connection: Connection) {
  const documents = new TextDocuments(TextDocument);

  connection.onInitialize(() => ({
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ['|', ' ', '{'] },
      hoverProvider: true,
      documentFormattingProvider: true,
    },
    serverInfo: { name: 'janja-language-server' },
  }));

  const validate = async (document: TextDocument) => {
    const { version } = document;
    const found = await getDiagnostics(document.getText());

    // The document may have changed, or been closed, while it was checked
    if (documents.get(document.uri)?.version !== version) {
      return;
    }

    const diagnostics: Diagnostic[] = found.map(
      ({ severity, message, line, column, length }) => ({
        severity:
          severity === 'error'
            ? DiagnosticSeverity.Error
            : DiagnosticSeverity.Warning,
        range: {
          start: { line, character: column },
          end: { line, character: column + length },
        },
        message,
        source: 'janja',
      }),
    );

    await connection.sendDiagnostics({
      uri: document.uri,
      version,
      diagnostics,
    });
  };

  documents.onDidChangeContent(({ document }) => void validate(document));

  documents.onDidClose(({ document }) => {
    void connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
  });

  connection.onCompletion(({ textDocument, position }): CompletionItem[] => {
    const document = documents.get(textDocument.uri);

    if (!document) {
      return [];
    }

    return getCompletions(document.getText(), document.offsetAt(position)).map(
      ({ label, kind, detail, snippet }) => ({
        label,
        kind: completionKinds[kind],
        detail,
        ...(snippet
          ? { insertText: snippet, insertTextFormat: InsertTextFormat.Snippet }
          : {}),
      }),
    );
  });

  connection.onHover(({ textDocument, position }) => {
    const document = documents.get(textDocument.uri);
    const hover =
      document && getHover(document.getText(), document.offsetAt(position));

    if (!hover) {
      return null;
    }

    return {
      contents: { kind: MarkupKind.Markdown, value: hover.contents },
      range: {
        start: document.positionAt(hover.start),
        end: document.positionAt(hover.end),
      },
    };
  });

  connection.onDocumentFormatting(({ textDocument }) => {
    const document = documents.get(textDocument.uri);
    const formatted = document && formatDocument(document.getText());

    if (!formatted) {
      return [];
    }

    return [
      {
        range: {
          start: { line: 0, character: 0 },
          end: document.positionAt(document.getText().length),
        },
        newText: formatted,
      },
    ];
  });

  documents.listen(connection);
  connection.listen();
}
