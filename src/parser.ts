import { CompileError } from './compile-error';
import { ExpParser } from './exp/exp-parser';
import {
  RootNode,
  SyntaxNode,
  UnexpectedNode,
  UnknownNode,
} from './syntax-nodes';
import { Tokenizer } from './tokenizer';
import {
  type DirectiveExpression,
  type DirectiveToken,
  type Token,
  TokenType,
} from './types';

export class Parser extends Tokenizer {
  private expParser!: ExpParser;

  protected cursor!: number;

  async parse(template: string) {
    this.tokenize(template);

    const start = this.tokens[0]?.loc.start ?? { line: 1, column: 1 };
    const end = this.tokens.at(-1)?.loc.end ?? { line: 1, column: 1 };

    this.expParser = new ExpParser(template);

    this.cursor = 0;

    return new RootNode(await this.parseUntil(), { start, end });
  }

  async parseUntil(names?: string[]) {
    const nodes: SyntaxNode[] = [];

    let prevToken: Token | null = null;

    while (true) {
      const token = this.peek();

      if (
        !token ||
        (token.type === TokenType.DIRECTIVE &&
          names &&
          this.match(names, token))
      ) {
        break;
      }

      if (prevToken?.strip?.after && token.type === TokenType.TEXT) {
        token.strip.start = true;
      }

      if (token.strip?.before && prevToken?.type === TokenType.TEXT) {
        prevToken.strip.end = true;
      }

      const g = this.options.parsers[
        (token as DirectiveToken).name?.toLowerCase() ??
          token.type?.toLowerCase()
      ]?.(token, this);

      if (g) {
        while (true) {
          const { value, done } = await g.next();

          if (done) {
            break;
          }

          if (value === 'NEXT') {
            this.advance();
          } else if (value) {
            nodes.push(value);
          }
        }
      } else {
        nodes.push(this.createUnknownNode(token));
      }

      prevToken = token;
    }

    return nodes;
  }

  createUnexpectedNode(token: Token) {
    const name = (token as DirectiveToken).name ?? token.type;

    this.options.debug?.(
      new CompileError(
        `Unexpected "${name}" directive`,
        this.template,
        token.loc,
      ),
    );

    this.advance();

    return new UnexpectedNode(name, token.val, token.loc, token.strip);
  }

  private createUnknownNode(token: Token) {
    const name = (token as DirectiveToken).name ?? token.type;

    this.options.debug?.(
      new CompileError(`Unknown "${name}" node`, this.template, token.loc),
    );

    this.advance();

    return new UnknownNode(name, token.val, token.loc, token.strip);
  }

  parseExp({ val, loc }: DirectiveExpression) {
    return this.expParser.parse(val, loc)!;
  }

  peek() {
    return this.tokens.at(this.cursor) ?? null;
  }

  advance() {
    this.cursor++;
  }

  match(names: string[], token = this.peek()) {
    return names.includes((token as DirectiveToken)?.name);
  }

  emitExpErr({ name, loc }: DirectiveToken, required = true) {
    this.options.debug?.(
      new CompileError(
        required
          ? `"${name}" requires expression`
          : `"${name}" should not have expression`,
        this.template,
        loc,
      ),
    );
  }
}
