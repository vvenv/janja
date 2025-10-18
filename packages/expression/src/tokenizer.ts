import type { Token } from './types'
import { ParseError } from './parse-error'
import { symbols } from './symbols'

export class Tokenizer {
  template = ''
  length = 0
  tokens: Token[] = []
  cursor = 0

  tokenize(template: string) {
    this.template = template
    this.length = template.length
    this.tokens = []
    this.cursor = 0

    while (this.cursor < this.length) {
      const char = this.template[this.cursor]

      if (this.isWhitespace(char)) {
        this.cursor++
        continue
      }

      if (char === '\'' || char === '"' || char === '`') {
        this.readString(char)
        continue
      }

      if (this.isDigit(char)) {
        this.readNumber()
        continue
      }

      if (this.isIdentifierStartChar(char)) {
        this.readIdentifier()
        continue
      }

      if (this.isSymbol(char)) {
        this.readSymbol(char)
        continue
      }

      throw new ParseError(`unexpect "${char}"`, { source: template, loc: {
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
      type: 'STR',
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

      if (this.isDigit(char)) {
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
      type: 'NUM',
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

      if (this.isIdentifierChar(char)) {
        value += char

        this.cursor++
        continue
      }

      break
    }

    const type = value in symbols ? symbols[value as keyof typeof symbols] : 'ID'

    this.tokens.push({
      type,
      value: type === 'BOOL' ? value === 'true' : value,
      start,
      end: this.cursor,
      raw: value,
    })
  }

  private readSymbol(char: string) {
    const start = this.cursor

    this.tokens.push({
      type: symbols[char],
      value: char,
      start,
      end: this.cursor,
      raw: char,
    })

    this.cursor++
  }

  private isWhitespace(char: string) {
    return /\s/.test(char)
  }

  private isSymbol(char: string) {
    return /[+\-*/%|=(),]/.test(char)
  }

  private isDigit(char: string) {
    return /[-\d]/.test(char)
  }

  private isIdentifierStartChar(char: string) {
    return /[a-z_$]/i.test(char)
  }

  private isIdentifierChar(char: string) {
    return /[\w$]/.test(char)
  }
}
