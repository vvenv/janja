import { CompileError } from './compile-error';
import { ExpParser } from './exp/exp-parser';
import type { Exp } from './exp/exp-types';
import { RootNode, type SyntaxNode } from './syntax-nodes';
import { Tokenizer } from './tokenizer';
import {
  type DirectiveExpression,
  type DirectiveToken,
  type ParserFn,
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

    this.expParser = new ExpParser();

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

      let parser =
        this.options.parsers[
          (token as DirectiveToken).name?.toLowerCase() ??
            token.type?.toLowerCase()
        ];

      if (typeof parser === 'string') {
        parser = this.options.parsers[parser];
      }

      if (!parser) {
        parser = this.options.parsers['unknown'];
      }

      const ag = (parser as ParserFn)?.(token, this);

      if (ag) {
        while (true) {
          const { value, done } = await ag.next();

          if (done) {
            break;
          }

          if (value === 'NEXT') {
            this.advance();
          } else if (value) {
            nodes.push(value);
          }
        }
      }

      prevToken = token;
    }

    return nodes;
  }

  parseExp<T extends Exp = Exp>({ val, loc }: DirectiveExpression) {
    try {
      return this.expParser.parse(val, loc) as T;
    } catch (error: any) {
      this.options.debug(
        error.loc
          ? new CompileError(error.message, this.template, error.loc)
          : error,
      );
    }
  }

  peek() {
    return this.tokens.at(this.cursor) ?? null;
  }

  private advance() {
    this.cursor++;
  }

  match(names: string[], token = this.peek()) {
    return names.includes((token as DirectiveToken)?.name);
  }

  emitExpErr({ name, loc }: DirectiveToken, required = true) {
    this.options.debug(
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
