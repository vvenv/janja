import type {
  ExpToken,
  Loc,
  Pos,
} from './types'
import { CompileError } from './compile-error'
import { expTokenTypes } from './exp-token-types'
import { updatePosition } from './update-position'

export class ExpTokenizer implements Pos {
  val = ''
  tokens: ExpToken[] = []
  index = 0

  line = 1
  column = 1

  constructor(private readonly template: string) {}

  tokenize(val: string, loc: Loc) {
    this.val = val
    this.index = 0
    this.line = loc.start.line
    this.column = loc.start.column
    this.tokens = []

    while (this.index < this.val.length) {
      const char = this.val[this.index]

      if (isWhitespace(char)) {
        if (char === '\n') {
          this.line++
          this.column = 0
        }
        else {
          this.column++
        }

        this.index++
        continue
      }

      if (char === '\'' || char === '"' || char === '`') {
        this.readString(char)
        continue
      }

      if (isDigit(char)) {
        this.readNumber()
        continue
      }

      if (isIdentifierStartChar(char)) {
        this.readIdentifier()
        continue
      }

      if (isSymbol(char)) {
        this.readSymbol(char)
        continue
      }

      throw new CompileError(
        `Unexpect "${char}"`,
        this.template,
        {
          start: { line: this.line, column: this.column },
          end: { line: this.line, column: this.column + 1 },
        },
      )
    }

    return this.tokens
  }

  private readString(quoteChar: string) {
    let value = ''
    let escaped = false

    const start: Pos = { line: this.line, column: this.column }

    // Skip opening quote char
    this.index++

    while (this.index < this.val.length) {
      const char = this.val[this.index]

      if (escaped) {
        value += char
        escaped = false
      }
      else if (char === '\\') {
        value += char
        escaped = true
      }
      else if (char === quoteChar) {
        break
      }
      else {
        value += char
      }

      this.index++
    }

    // skip closing quote char
    this.index++

    this.tokens.push({
      type: 'LIT',
      value,
      loc: {
        start,
        end: updatePosition(value, this),
      },
      raw: `${quoteChar}${value}${quoteChar}`,
    })
  }

  private readNumber() {
    let value = ''
    let hasDot = false

    const start: Pos = { line: this.line, column: this.column }

    while (this.index < this.val.length) {
      const char = this.val[this.index]

      if (isDigit(char)) {
        value += char
      }
      else if (char === '.' && !hasDot) {
        value += char
        hasDot = true
      }
      else {
        break
      }

      this.index++
    }

    this.tokens.push({
      type: 'LIT',
      value: Number.parseFloat(value),
      loc: {
        start,
        end: updatePosition(value, this),
      },
      raw: value,
    })
  }

  private readIdentifier() {
    let value = ''

    const start: Pos = { line: this.line, column: this.column }

    while (this.index < this.val.length) {
      const char = this.val[this.index]

      if (isIdentifierChar(char)) {
        value += char

        this.index++
        continue
      }

      break
    }

    const type = value in expTokenTypes ? expTokenTypes[value as keyof typeof expTokenTypes] : 'ID'

    this.tokens.push({
      type,
      value: type === 'LIT'
        ? value === 'true'
          ? true
          : value === 'false'
            ? false
            : value === 'null'
              ? null
              : value === 'undefined'
                ? undefined
                : value
        : value,
      loc: {
        start,
        end: updatePosition(value, this),
      },
      raw: value,
    })
  }

  private readSymbol(char: string) {
    const start: Pos = { line: this.line, column: this.column }

    this.index++

    this.tokens.push({
      type: expTokenTypes[char],
      value: char,
      loc: {
        start,
        end: updatePosition(char, this),
      },
      raw: char,
    })
  }
}

function isWhitespace(char: string) {
  return /\s/.test(char)
}

function isSymbol(char: string) {
  return /[+\-*/%|=(),.]/.test(char)
}

function isDigit(char: string) {
  return /[-\d]/.test(char)
}

function isIdentifierStartChar(char: string) {
  return /[a-z_$]/i.test(char)
}

function isIdentifierChar(char: string) {
  return /[\w$]/.test(char)
}
