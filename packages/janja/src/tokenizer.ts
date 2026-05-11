import { CompileError } from './compile-error';
import {
  type DirectiveToken,
  type ParserOptions,
  type Pos,
  type Token,
  TokenType,
} from './types';
import { unescapeTag } from './unescape-tag';
import { updatePosition } from './update-position';

export class Tokenizer implements Pos {
  template!: string;

  protected length!: number;

  protected index!: number;

  protected tokens!: Token[];

  private tokenPatterns!: [TokenType, string, string][];

  private markerIndices!: Map<string, number>;

  line = 1;

  column = 1;

  constructor(public options: Required<ParserOptions>) {
    const {
      commentOpen,
      commentClose,
      directiveOpen,
      directiveClose,
      outputOpen,
      outputClose,
    } = this.options;

    this.tokenPatterns = [
      [TokenType.COMMENT, commentOpen, commentClose],
      [TokenType.DIRECTIVE, directiveOpen, directiveClose],
      [TokenType.OUTPUT, outputOpen, outputClose],
    ].sort(([, open1], [, open2]) =>
      open1.length > open2.length ? -1 : 1,
    ) as [TokenType, string, string][];

    // Build a map of first character to marker patterns for faster lookup
    this.markerIndices = new Map();

    for (const [, open] of this.tokenPatterns) {
      if (open.length > 0) {
        this.markerIndices.set(open[0], this.markerIndices.get(open[0]) || 0);
      }
    }
  }

  tokenize(template: string) {
    this.template = template;
    this.length = template.length;
    this.index = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];

    while (this.index < this.length) {
      if (this.consumeSpecialTokens()) {
        continue;
      }

      this.consumeTextToken();
    }

    return this.tokens;
  }

  private consumeSpecialTokens() {
    return this.tokenPatterns.some(([type, openMarker, closeMarker]) => {
      if (!this.lookahead(openMarker)) {
        return false;
      }

      const start = {
        line: this.line,
        column: this.column,
      };
      const endIndex = this.template.indexOf(
        closeMarker,
        this.index + openMarker.length,
      );

      if (endIndex === -1) {
        throw new CompileError(`Unclosed "${openMarker}"`, this.template, {
          start,
          end: updatePosition(openMarker, { ...start }),
        });
      }

      const stripBefore = this.lookahead('-', openMarker.length);
      const stripAfter = this.template[endIndex - 1] === '-';

      const val = this.template.slice(
        this.index + openMarker.length + +stripBefore,
        endIndex - +stripAfter,
      );
      const end = updatePosition(
        this.template.slice(
          this.index,
          (this.index = endIndex + closeMarker.length),
        ),
        this,
      );
      const token: Token = {
        type,
        val: unescapeTag(val),
        strip: {
          before: stripBefore,
          after: stripAfter,
        },
        loc: {
          start,
          end,
        },
      } as Token;

      if (type === TokenType.DIRECTIVE) {
        let i = 0;
        let name = '';

        while (i < val.length) {
          const char = val[i];

          if (/\S/.test(char)) {
            name += char;
          } else if (name) {
            break;
          }

          i++;
        }

        Object.assign(token as DirectiveToken, {
          name,
          expression:
            i === val.length || /^\s*$/m.test(val.slice(i + 1))
              ? null
              : {
                  val: val.slice(i + 1),
                  loc: {
                    start: updatePosition(
                      val.slice(0, i + 1),
                      updatePosition(`${openMarker}${stripBefore ? '-' : ''}`, {
                        ...start,
                      }),
                    ),
                    end: {
                      line: this.line,
                      column: this.column - closeMarker.length - +stripAfter,
                    },
                  },
                },
        });
      }

      this.tokens.push(token);

      return true;
    });
  }

  private consumeTextToken() {
    const nextSpecialIndex = this.findNextSpecialIndex();

    const start = {
      line: this.line,
      column: this.column,
    };
    const val = this.template.slice(this.index, nextSpecialIndex);

    this.tokens.push({
      type: TokenType.TEXT,
      val: unescapeTag(val),
      loc: {
        start,
        end: updatePosition(val, this),
      },
      strip: {},
    });

    this.index = nextSpecialIndex;
  }

  private lookahead(marker: string, offset = 0) {
    return this.template.startsWith(marker, this.index + offset);
  }

  private findNextSpecialIndex() {
    const { outputOpen, directiveOpen, commentOpen } = this.options;

    let minIndex = this.length;

    // Find the earliest occurrence of any special marker
    for (let i = this.index; i < this.length; i++) {
      // Check each marker at current position
      if (this.template.startsWith(commentOpen, i)) {
        minIndex = i;

        break;
      }

      if (this.template.startsWith(directiveOpen, i)) {
        minIndex = i;

        break;
      }

      if (this.template.startsWith(outputOpen, i)) {
        minIndex = i;

        break;
      }
    }

    return minIndex;
  }
}
