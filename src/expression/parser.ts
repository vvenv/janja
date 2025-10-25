import type {
  BinaryExp,
  BoolExp,
  Checker,
  Exp,
  ExpToken,
  ExpTokenType,
  IdExp,
  IfExp,
  NotExp,
  NumExp,
  PipeExp,
  SeqExp,
  StrExp,
} from '../types'
import { ParseError } from '../utils/parse-error'
import { precedences } from './precedences'
import { Tokenizer } from './tokenizer'

export class Parser {
  template = ''
  tokens: ExpToken[] = []
  length = 0
  cursor = 0

  parse(template: string) {
    this.template = template
    this.tokens = new Tokenizer().tokenize(template)
    this.length = this.tokens.length
    this.cursor = 0

    return this.template ? this.parseExpression() : null
  }

  private parseExpression(checker?: Checker): Exp | null {
    let left: Exp | null = null

    while (true) {
      const token = this.next()

      if (!token) {
        break
      }

      const check = checker?.(token)

      if (check === 'BACK') {
        this.back()
        break
      }

      if (check === 'BREAK') {
        break
      }

      if (token.type === 'LP') {
        if (!this.peek()) {
          throw new ParseError(`unexpected end of expression`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }

        const elements = this.parseSequence()

        const rp = this.consume('RP')

        if (!rp) {
          throw new ParseError(`expected "RP" after "LP"`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }

        left = {
          ...token,
          type: 'SEQ',
          elements,
          end: rp.end,
        } satisfies SeqExp
        continue
      }

      if (token.type === 'NOT') {
        if (!this.peek()) {
          throw new ParseError(`unexpected end of expression`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }

        left = {
          ...token,
          type: 'NOT',
          argument: this.parseExpression(
            t => isHigher(token, t) ? 'BACK' : undefined,
          )!,
        } satisfies NotExp
        continue
      }

      if (token.type === 'ID') {
        left = {
          ...token,
          type: 'ID',
          value: token.value as string,
        } satisfies IdExp

        if (this.check('DOT')) {
          left.path = this.parsePath()
        }

        if (this.consume('LP')) {
          left.args = this.parseSequence()

          const rp = this.consume('RP')

          if (!rp) {
            throw new ParseError(`expected "RP" after "LP"`, {
              source: this.template,
              range: {
                start: token.start,
                end: token.end,
              },
            })
          }
          continue
        }
        continue
      }

      if (token.type === 'STR') {
        left = {
          ...token,
          type: 'STR',
          value: token.value as string,
        } satisfies StrExp
        continue
      }

      if (token.type === 'NUM') {
        left = {
          ...token,
          type: 'NUM',
          value: token.value as number,
        } satisfies NumExp
        continue
      }

      if (token.type === 'BOOL') {
        left = {
          ...token,
          type: 'BOOL',
          value: token.value as boolean,
        } satisfies BoolExp
        continue
      }

      if (token.type === 'IF') {
        const test = this.parseExpression(
          t => t.type === 'ELSE' ? 'BACK' : isHigher(token, t) ? 'BACK' : undefined,
        )
        if (!test) {
          throw new ParseError('expected test expression', {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }
        left = {
          ...token,
          type: 'IF',
          test,
          consequent: left!,
        } satisfies IfExp
        if (this.consume('ELSE')) {
          const alternative = this.parseExpression(
            t => isHigher(token, t) ? 'BACK' : undefined,
          )
          if (!alternative) {
            throw new ParseError('expected else expression', {
              source: this.template,
              range: {
                start: token.start,
                end: token.end,
              },
            })
          }
          (left as IfExp).alternative = alternative
        }
        continue
      }

      if (token.type === 'AND'
        || token.type === 'OR'
        || token.type === 'EQ'
        || token.type === 'NE'
        || token.type === 'GT'
        || token.type === 'LT'
        || token.type === 'GE'
        || token.type === 'LE'
        || token.type === 'IN'
        || token.type === 'NI'
        || token.type === 'OF'
        || token.type === 'ADD'
        || token.type === 'SUB'
        || token.type === 'MUL'
        || token.type === 'DIV'
        || token.type === 'MOD'
        || token.type === 'SET'
      ) {
        if (!left) {
          throw new ParseError(`no left operand for "${token.type}"`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }

        const right = this.parseExpression(
          t => isHigher(token, t) ? 'BACK' : undefined,
        )

        if (!right) {
          throw new ParseError(`no right operand for "${token.type}"`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }

        left = {
          ...token,
          type: token.type,
          left,
          right,
        } satisfies BinaryExp
        continue
      }

      if (token.type === 'PIPE') {
        if (!left) {
          throw new ParseError(`no left operand for "${token.type}"`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }
        if (!this.check('ID')) {
          throw new ParseError(`expected "ID" after "PIPE"`, {
            source: this.template,
            range: {
              start: token.start,
              end: token.end,
            },
          })
        }
        left = {
          ...token,
          type: 'PIPE',
          left,
          right: this.parsePipe(),
        } satisfies PipeExp
        continue
      }

      this.back()
      break
    }

    return left
  }

  private parsePath() {
    const ids: IdExp[] = []

    while (true) {
      const dot = this.consume('DOT')
      if (!dot) {
        break
      }
      const token = this.next()
      if (!token) {
        throw new ParseError('expected "ID" after "DOT"', {
          source: this.template,
          range: {
            start: dot.start,
            end: dot.end,
          },
        })
      }
      if (token.type !== 'ID') {
        throw new ParseError(`expected "ID" after "DOT"`, {
          source: this.template,
          range: {
            start: token.start,
            end: token.end,
          },
        })
      }
      ids.push({
        ...token,
        type: 'ID',
        value: token.value as string,
      } satisfies IdExp)
    }

    return ids
  }

  private parseSequence() {
    const elements: Exp[] = []

    while (!this.check('RP')) {
      const element = this.parseExpression(
        t => t.type === 'COMMA' ? 'BREAK' : undefined,
      )!
      if (element) {
        elements.push(element)
      }
      else {
        break
      }
    }

    return elements
  }

  private parsePipe() {
    const token = this.next()!

    const right = {
      ...token,
      type: 'ID',
      value: token.value as string,
    } as IdExp

    if (this.consume('LP')) {
      const args = this.parseSequence()

      if (args.length) {
        right.args = args
      }

      const rp = this.consume('RP')

      if (!rp) {
        throw new ParseError(`expected "RP" after "LP"`, {
          source: this.template,
          range: {
            start: token.start,
            end: token.end,
          },
        })
      }
    }

    return right
  }

  private next(): ExpToken | null {
    return this.tokens[this.cursor++] ?? null
  }

  private back(): ExpToken {
    return this.tokens[this.cursor--]
  }

  private peek() {
    return this.tokens[this.cursor] ?? null
  }

  private check(type: ExpTokenType) {
    return this.peek()?.type === type
  }

  private consume(type: ExpTokenType) {
    if (this.check(type)) {
      return this.next()
    }
  }
}

function isHigher(a: ExpToken, b: ExpToken) {
  return precedences[a.type] > precedences[b.type]
}
