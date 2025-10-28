import type { ExpToken } from './types'
import { expTokenTypes } from './exp-token-types'
import { ParseError } from './parse-error'

export class ExpTokenizer {
  template = ''
  length = 0
  tokens: ExpToken[] = []
  cursor = 0

  tokenize(template: string) {
    this.template = template
    this.length = template.length
    this.tokens = []
    this.cursor = 0

    while (this.cursor < this.length) {
      const char = this.template[this.cursor]

      if (isWhitespace(char)) {
        this.cursor++
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

      throw new ParseError(`unexpect "${char}"`, { source: template, range: {
        start: this.cursor,
        end: this.cursor + 1,
      } })
    }

    return this.tokens
  }

  private readString(quoteChar: string) {
    let value = ''
    let escaped = false

    const start = this.cursor

    // Skip opening quote char
    this.cursor++

    while (this.cursor < this.length) {
      const char = this.template[this.cursor]

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

      this.cursor++
    }

    // skip closing quote char
    this.cursor++

    this.tokens.push({
      type: 'LIT',
      value,
      start,
      end: this.cursor,
      raw: `${quoteChar}${value}${quoteChar}`,
    })
  }

  private readNumber() {
    let value = ''
    let hasDot = false

    const start = this.cursor

    while (this.cursor < this.length) {
      const char = this.template[this.cursor]

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

      this.cursor++
    }

    this.tokens.push({
      type: 'LIT',
      value: Number.parseFloat(value),
      start,
      end: this.cursor,
      raw: value,
    })
  }

  private readIdentifier() {
    let value = ''

    const start = this.cursor

    while (this.cursor < this.length) {
      const char = this.template[this.cursor]

      if (isIdentifierChar(char)) {
        value += char

        this.cursor++
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
      start,
      end: this.cursor,
      raw: value,
    })
  }

  private readSymbol(char: string) {
    const start = this.cursor

    this.tokens.push({
      type: expTokenTypes[char],
      value: char,
      start,
      end: this.cursor,
      raw: char,
    })

    this.cursor++
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
