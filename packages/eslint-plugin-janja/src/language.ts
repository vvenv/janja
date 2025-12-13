import type { File, Language, OkParseResult, ParseResult } from '@eslint/core';
import type { Loc, ParserOptions, Token } from 'janja';
import { Parser } from './parser';
import { SourceCode } from './source-code';

export type LanguageOptions = Pick<
  ParserOptions,
  | 'commentOpen'
  | 'commentClose'
  | 'directiveOpen'
  | 'directiveClose'
  | 'outputOpen'
  | 'outputClose'
>;

export interface AST {
  type: 'ROOT';
  body: Token[];
  loc: Loc;
}

export class JanjaLanguage implements Language {
  fileType = 'text' as const;

  lineStart = 1 as const;

  columnStart = 1 as const;

  nodeTypeKey = 'type';

  visitorKeys = {
    ROOT: ['body'],
  };

  private parser: Parser;

  constructor(options: Partial<ParserOptions> = {}) {
    this.parser = new Parser(options);
  }

  validateLanguageOptions(_languageOptions: LanguageOptions) {
    // No validation needed for now
  }

  parse(
    file: File,
    _context?: { languageOptions?: LanguageOptions },
  ): ParseResult<AST> {
    try {
      const tokens = this.parser.parse(file.body as string);
      const lines = (file.body as string).split('\n') || [];
      const ast: AST = {
        type: 'ROOT',
        body: tokens,
        loc: {
          start: { line: 1, column: 1 },
          end: {
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
          },
        },
      };

      return {
        ok: true,
        ast,
      };
    } catch (error) {
      return {
        ok: false,
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
            line: 1,
            column: 1,
          },
        ],
      };
    }
  }

  createSourceCode({ body }: File, { ast }: OkParseResult<AST>) {
    return new SourceCode({
      text: body as string,
      ast,
      parser: this.parser,
    });
  }
}
