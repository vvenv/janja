/* eslint-disable no-template-curly-in-string */
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, expect, it } from 'vitest';
import {
  createConnection,
  createMessageConnection,
  type MessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-languageserver/node.js';
import { startServer } from './server.js';

// A real protocol session over in-memory streams: what an editor would send
// and receive, without spawning a process
let client: MessageConnection;
let diagnostics: Record<string, any[]>;
let waiting: (() => void) | undefined;

const uri = 'file:///page.janja';

beforeEach(async () => {
  const toServer = new PassThrough();
  const toClient = new PassThrough();

  startServer(
    createConnection(
      new StreamMessageReader(toServer),
      new StreamMessageWriter(toClient),
    ),
  );

  client = createMessageConnection(
    new StreamMessageReader(toClient),
    new StreamMessageWriter(toServer),
  );
  diagnostics = {};
  client.onNotification('textDocument/publishDiagnostics', (params: any) => {
    diagnostics[params.uri] = params.diagnostics;
    waiting?.();
  });
  client.listen();

  await client.sendRequest('initialize', {
    processId: null,
    rootUri: null,
    capabilities: {},
  });
  await client.sendNotification('initialized', {});
});

afterEach(() => {
  client.dispose();
});

const published = () =>
  new Promise<void>((resolve) => {
    waiting = resolve;
  });

async function open(text: string) {
  const done = published();

  await client.sendNotification('textDocument/didOpen', {
    textDocument: { uri, languageId: 'janja', version: 1, text },
  });
  await done;
}

it('announces its capabilities', async () => {
  // a second connection, to look at the initialize result itself
  const toServer = new PassThrough();
  const toClient = new PassThrough();

  startServer(
    createConnection(
      new StreamMessageReader(toServer),
      new StreamMessageWriter(toClient),
    ),
  );

  const other = createMessageConnection(
    new StreamMessageReader(toClient),
    new StreamMessageWriter(toServer),
  );

  other.listen();

  expect(
    await other.sendRequest('initialize', {
      processId: null,
      rootUri: null,
      capabilities: {},
    }),
  ).toMatchObject({
    capabilities: {
      completionProvider: { triggerCharacters: ['|', ' ', '{'] },
      hoverProvider: true,
      documentFormattingProvider: true,
    },
    serverInfo: { name: 'janja-language-server' },
  });

  other.dispose();
});

it('publishes diagnostics when a document is opened, edited and closed', async () => {
  await open('ok\n  {{ if }}x{{ endif }}');

  expect(diagnostics[uri]).toEqual([
    {
      severity: 1,
      source: 'janja',
      message: '"if" requires expression',
      range: {
        start: { line: 1, character: 2 },
        end: { line: 1, character: 10 },
      },
    },
    expect.objectContaining({ message: 'Unexpected "endif"' }),
  ]);

  let done = published();

  // an incremental edit: insert the missing expression
  await client.sendNotification('textDocument/didChange', {
    textDocument: { uri, version: 2 },
    contentChanges: [
      {
        range: {
          start: { line: 1, character: 7 },
          end: { line: 1, character: 7 },
        },
        text: ' a | nope',
      },
    ],
  });
  await done;

  expect(diagnostics[uri]).toEqual([
    expect.objectContaining({
      severity: 2,
      message: 'Unknown filter "nope"',
    }),
  ]);

  done = published();
  await client.sendNotification('textDocument/didClose', {
    textDocument: { uri },
  });
  await done;

  expect(diagnostics[uri]).toEqual([]);
});

it('completes directives and filters', async () => {
  await open('{{ \n{{= name | ');

  const directives: any[] = await client.sendRequest(
    'textDocument/completion',
    { textDocument: { uri }, position: { line: 0, character: 3 } },
  );

  expect(directives.find(({ label }) => label === 'for')).toEqual({
    label: 'for',
    kind: 14,
    insertText: 'for ${1:item} of ${2:items} }}$0{{ endfor',
    insertTextFormat: 2,
  });

  const filters: any[] = await client.sendRequest('textDocument/completion', {
    textDocument: { uri },
    position: { line: 1, character: 11 },
  });

  expect(filters.map(({ label }) => label)).toContain('upper');
  expect(filters[0]).toMatchObject({ kind: 3, detail: 'built-in filter' });
});

it('shows documentation on hover', async () => {
  await open('{{ for x of list }}{{ endfor }}');

  expect(
    await client.sendRequest('textDocument/hover', {
      textDocument: { uri },
      position: { line: 0, character: 4 },
    }),
  ).toMatchObject({
    contents: { kind: 'markdown' },
    range: { start: { line: 0, character: 3 }, end: { line: 0, character: 6 } },
  });
  expect(
    await client.sendRequest('textDocument/hover', {
      textDocument: { uri },
      position: { line: 0, character: 13 },
    }),
  ).toBeNull();
});

it('formats documents', async () => {
  await open('<p>\n{{=name|upper}}\n</p>');

  expect(
    await client.sendRequest('textDocument/formatting', {
      textDocument: { uri },
      options: { tabSize: 2, insertSpaces: true },
    }),
  ).toEqual([
    {
      range: {
        start: { line: 0, character: 0 },
        end: { line: 2, character: 4 },
      },
      newText: '<p>\n{{= name | upper }}\n</p>',
    },
  ]);

  // nothing to do for a document that is already formatted
  await client.sendNotification('textDocument/didChange', {
    textDocument: { uri, version: 2 },
    contentChanges: [{ text: '{{= name }}' }],
  });

  expect(
    await client.sendRequest('textDocument/formatting', {
      textDocument: { uri },
      options: { tabSize: 2, insertSpaces: true },
    }),
  ).toEqual([]);
});
