import { TextSourceCodeBase, VisitNodeStep } from '@eslint/plugin-kit';
import { type Token } from 'janja';
import type { AST } from './language';
import type { Parser } from './parser';

export class SourceCode extends TextSourceCodeBase {
  ast: AST;

  parser: Parser;

  constructor({
    text,
    ast,
    parser,
  }: {
    text: string;
    ast: AST;
    parser: Parser;
  }) {
    super({ text, ast });
    this.ast = ast;
    this.parser = parser;
  }

  getLoc({ loc }: Token) {
    return loc;
  }

  traverse() {
    const steps: VisitNodeStep[] = [];

    // Exit ROOT node
    steps.unshift(
      new VisitNodeStep({
        target: this.ast,
        phase: 2,
        args: [this.ast, this.parser],
      }),
    );

    for (const token of this.ast.body) {
      // Exit phase
      steps.unshift(
        new VisitNodeStep({
          target: token,
          phase: 2,
          args: [token, this.ast, this.parser],
        }),
      );

      // Enter phase
      steps.unshift(
        new VisitNodeStep({
          target: token,
          phase: 1,
          args: [token, this.ast, this.parser],
        }),
      );
    }

    // Visit ROOT node first
    steps.unshift(
      new VisitNodeStep({
        target: this.ast,
        phase: 1,
        args: [this.ast, this.parser],
      }),
    );

    return steps;
  }

  getParent(_token: Token) {
    return this.ast;
  }
}
