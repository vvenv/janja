#!/usr/bin/env node
import {
  createConnection,
  ProposedFeatures,
} from 'vscode-languageserver/node.js';
import { startServer } from './server.js';

// The transport is taken from the command line, as editors pass it:
// --stdio, --node-ipc or --socket=<port>
startServer(createConnection(ProposedFeatures.all));
