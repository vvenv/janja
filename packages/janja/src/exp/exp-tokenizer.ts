import type { Loc, Pos, Primitive } from '../types';
import { updatePosition } from '../update-position';
import { ExpError } from './exp-error';
import type { ExpTokenType } from './exp-types';

export interface ExpToken<T = ExpTokenType> {
  type: T;
  value: Primitive;
  loc: Loc;
  raw?: string;
}

export const expTokenTypes: Record<string, ExpTokenType> = {
  and: 'AND',
  or: 'OR',
  not: 'NOT',

  is: 'IS',
  eq: 'EQ',
  ne: 'NE',
  gt: 'GT',
  lt: 'LT',
  ge: 'GE',
  le: 'LE',
  in: 'IN',
  ni: 'NI',
  of: 'OF',

  '+': 'ADD',
  '-': 'SUB',
  '*': 'MUL',
  '/': 'DIV',
  '%': 'MOD',

  if: 'IF',
  else: 'ELSE',

  true: 'LIT',
  false: 'LIT',
  null: 'LIT',
  undefined: 'LIT',

  '|': 'PIPE',

  '=': 'ASSIGN',
  '(': 'LP',
  ')': 'RP',
  ',': 'COMMA',
  '.': 'DOT',
};

// Names that would let an expression climb out of the data it was given,
// e.g. `x.constructor.constructor("...")()`.
const forbiddenIdentifiers = new Set([
  'constructor',
  'prototype',
  '__proto__',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

export function isForbiddenIdentifier(name: unknown) {
  return typeof name === 'string' && forbiddenIdentifiers.has(name);
}

const stringEscapes: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '\\': '\\',
  '"': '"',
  "'": "'",
  '`': '`',
};

function normalizeLitValue(value: string) {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    case 'null':
      return null;
    case 'undefined':
      return undefined;
    default:
      return value;
  }
}

export class ExpTokenizer implements Pos {
  val = '';

  tokens: ExpToken[] = [];

  index = 0;

  line = 1;

  column = 1;

  tokenize(val: string, loc: Loc) {
    this.val = val;
    this.index = 0;
    this.line = loc.start.line;
    this.column = loc.start.column;
    this.tokens = [];

    while (this.index < this.val.length) {
      const char = this.val[this.index];

      if (isWhitespace(char)) {
        if (char === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }

        this.index++;

        continue;
      }

      if (char === "'" || char === '"' || char === '`') {
        this.readString(char);

        continue;
      }

      // "-" starts a negative number only where an operand may start;
      // after one (`a - 1`, `a -1`) it is the subtraction operator
      if (
        isDigit(char) ||
        (char === '-' &&
          isDigit(this.val[this.index + 1] ?? '') &&
          !this.afterOperand())
      ) {
        this.readNumber(char);

        continue;
      }

      if (isIdentifierStart(char)) {
        this.readIdentifier(char);

        continue;
      }

      if (isSymbol(char)) {
        this.readSymbol(char);

        continue;
      }

      throw new ExpError(`Unexpected "${char}"`, {
        start: { line: this.line, column: this.column },
        end: { line: this.line, column: this.column + 1 },
      });
    }

    return this.tokens;
  }

  private afterOperand() {
    const type = this.tokens.at(-1)?.type;

    return type === 'ID' || type === 'LIT' || type === 'RP';
  }

  private readString(quoteChar: string) {
    let value = '';
    // The string as written, which is what positions are computed from
    let raw = '';
    let escaped = false;

    const start: Pos = { line: this.line, column: this.column };

    // Skip opening quote char
    this.index++;

    while (this.index < this.val.length) {
      const char = this.val[this.index];

      if (escaped) {
        // Unknown escapes keep their backslash, so that patterns such as
        // "\d+" can be passed to filters as written
        value += stringEscapes[char] ?? `\\${char}`;
        raw += char;
        escaped = false;
      } else if (char === '\\') {
        raw += char;
        escaped = true;
      } else if (char === quoteChar) {
        break;
      } else {
        value += char;
        raw += char;
      }

      this.index++;
    }

    // skip closing quote char
    this.index++;

    this.tokens.push({
      type: 'LIT',
      value,
      loc: {
        start,
        end: updatePosition(`${quoteChar}${raw}${quoteChar}`, this),
      },
      raw: `${quoteChar}${raw}${quoteChar}`,
    });
  }

  private readNumber(startChar: string) {
    let value = startChar;
    let hasDot = false;

    const start: Pos = { line: this.line, column: this.column };

    this.index++;

    while (this.index < this.val.length) {
      const char = this.val[this.index];

      if (isDigit(char)) {
        value += char;
      } else if (char === '.' && !hasDot) {
        value += char;
        hasDot = true;
      } else {
        break;
      }

      this.index++;
    }

    this.tokens.push({
      type: 'LIT',
      value: Number.parseFloat(value),
      loc: {
        start,
        end: updatePosition(value, this),
      },
      raw: value,
    });
  }

  private readIdentifier(startChar: string) {
    let value = startChar;

    const start: Pos = { line: this.line, column: this.column };

    this.index++;

    while (this.index < this.val.length) {
      const char = this.val[this.index];

      if (isIdentifier(char)) {
        value += char;

        this.index++;

        continue;
      }

      break;
    }

    if (isForbiddenIdentifier(value)) {
      throw new ExpError(`"${value}" is not allowed in expressions`, {
        start,
        end: { line: this.line, column: this.column + value.length },
      });
    }

    const type = Object.prototype.hasOwnProperty.call(expTokenTypes, value)
      ? expTokenTypes[value]
      : 'ID';

    this.tokens.push({
      type,
      value: type === 'LIT' ? normalizeLitValue(value) : value,
      loc: {
        start,
        end: updatePosition(value, this),
      },
      raw: value,
    });
  }

  private readSymbol(char: string) {
    const start: Pos = { line: this.line, column: this.column };

    this.index++;

    this.tokens.push({
      type: expTokenTypes[char],
      value: char,
      loc: {
        start,
        end: updatePosition(char, this),
      },
      raw: char,
    });
  }
}

function isWhitespace(char: string) {
  return /\s/.test(char);
}

function isSymbol(char: string) {
  return /[+\-*/%|=(),.]/.test(char);
}

function isDigit(char: string) {
  return /\d/.test(char);
}

function isIdentifierStart(char: string) {
  return /[a-z_$]/i.test(char);
}

function isIdentifier(char: string) {
  return /[\w$]/.test(char);
}
