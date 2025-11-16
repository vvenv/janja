import type { DirectiveToken, ParserOptions, Pos, Token } from './types'
import { CompileError } from './compile-error'
import { parserOptions } from './config'
import { TokenType } from './types'
import { unescapeTag } from './unescape-tag'
import { updatePosition } from './update-position'

export class Tokenizer implements Pos {
  options: Required<ParserOptions>
  template!: string
  protected length!: number
  protected index!: number
  protected tokens!: Token[]

  private tokenPatterns!: [TokenType, string, string][]

  line = 1
  column = 1

  constructor(options?: ParserOptions) {
    this.options = {
      ...parserOptions,
      ...options,
    }

    const {
      commentOpen,
      commentClose,
      directiveOpen,
      directiveClose,
      outputOpen,
      outputClose,
    } = this.options

    this.tokenPatterns = ([
      [
        TokenType.COMMENT,
        commentOpen,
        commentClose,
      ],
      [
        TokenType.DIRECTIVE,
        directiveOpen,
        directiveClose,
      ],
      [
        TokenType.OUTPUT,
        outputOpen,
        outputClose,
      ],
    ].sort(
      ([,open1], [,open2]) => open1.length > open2.length ? -1 : 1,
    )) as [
      TokenType.COMMENT,
      string,
      string,
    ][]
  }

  tokenize(template: string) {
    this.template = template
    this.length = template.length
    this.index = 0
    this.line = 1
    this.column = 1
    this.tokens = []

    while (this.index < this.length) {
      if (this.consumeSpecialTokens()) {
        continue
      }

      this.consumeTextToken()
    }

    return this.tokens
  }

  private consumeSpecialTokens() {
    return this.tokenPatterns.some(
      ([type, openMarker, closeMarker]) => {
        if (!this.lookahead(openMarker)) {
          return false
        }

        const start = {
          line: this.line,
          column: this.column,
        }
        const endIndex = this.template.indexOf(
          closeMarker,
          this.index + openMarker.length,
        )
        if (endIndex === -1) {
          throw new CompileError(
            `Unclosed "${openMarker}"`,
            this.template,
            {
              start,
              end: updatePosition(openMarker, { ...start }),
            },
          )
        }
        const stripBefore = this.lookahead('-', openMarker.length)
        const stripAfter = this.template[endIndex - 1] === '-'

        const val = this.template.slice(
          this.index + openMarker.length + +stripBefore,
          endIndex - +stripAfter,
        )
        const end = updatePosition(
          this.template.slice(
            this.index, (
              this.index = endIndex + closeMarker.length
            )),
          this,
        )
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
        }

        if (type === TokenType.DIRECTIVE) {
          let i = 0
          let name = ''
          while (i < val.length) {
            const char = val[i]

            if (/\S/.test(char)) {
              name += char
            }
            else if (name) {
              break
            }

            i++
          }

          Object.assign(token as DirectiveToken, {
            name,
            expression: i === val.length || /^\s*$/m.test(val.slice(i + 1))
              ? null
              : {
                  val: val.slice(i + 1),
                  loc: {
                    start: updatePosition(
                      val.slice(0, i + 1),
                      updatePosition(
                        `${openMarker}${stripBefore ? '-' : ''}`,
                        { ...start },
                      ),
                    ),
                    end: {
                      line: this.line,
                      column: this.column - closeMarker.length - +stripAfter,
                    },
                  },
                },
          })
        }

        this.tokens.push(token)

        return true
      },
    )
  }

  private consumeTextToken() {
    const nextSpecialIndex = this.findNextSpecialIndex()
    if (nextSpecialIndex > this.index) {
      const start = {
        line: this.line,
        column: this.column,
      }
      const val = this.template.slice(
        this.index,
        nextSpecialIndex,
      )
      this.tokens.push({
        type: TokenType.TEXT,
        val: unescapeTag(val),
        loc: {
          start,
          end: updatePosition(val, this),
        },
        strip: {},
      })

      this.index = nextSpecialIndex
    }
    else {
      updatePosition(this.template[this.index++], this)
    }
  }

  private lookahead(marker: string, offset = 0) {
    return this.template.startsWith(marker, this.index + offset)
  }

  private findNextSpecialIndex() {
    const {
      outputOpen,
      directiveOpen,
      commentOpen,
    } = this.options

    const commentIndex = this.template.indexOf(commentOpen, this.index)
    const directiveIndex = this.template.indexOf(directiveOpen, this.index)
    const outputIndex = this.template.indexOf(outputOpen, this.index)

    const indexes = [
      commentIndex,
      directiveIndex,
      outputIndex,
    ]
      .filter(index => index !== -1)
      .sort((a, b) => a - b)

    return indexes.length ? indexes[0] : this.length
  }
}
