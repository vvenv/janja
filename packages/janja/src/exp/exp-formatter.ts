import type {
  BinaryExp,
  Exp,
  ExpTokenType,
  IdExp,
  IfExp,
  LitExp,
  NotExp,
  SeqExp,
} from './exp-types';

const expTokenOperators: Partial<Record<ExpTokenType, string>> = {
  AND: 'and',
  OR: 'or',
  IS: 'is',
  NOT: 'not',
  EQ: 'eq',
  NE: 'ne',
  GT: 'gt',
  LT: 'lt',
  GE: 'ge',
  LE: 'le',
  IN: 'in',
  NI: 'ni',
  OF: 'of',
  ADD: '+',
  SUB: '-',
  MUL: '*',
  DIV: '/',
  MOD: '%',
  PIPE: '|',
  ASSIGN: '=',
  LP: '(',
  RP: ')',
  COMMA: ',',
  DOT: '.',
  IF: 'if',
  ELSE: 'else',
};

export class ExpFormatter {
  format(expression: Exp | null) {
    return expression ? this.formatExp(expression) : '""';
  }

  private formatExp(expression: Exp): string {
    switch (expression.type) {
      case 'NOT':
        return this.formatNot(expression as NotExp);
      case 'ID':
        return this.formatId(expression as IdExp);
      case 'LIT':
        return this.formatLit(expression as LitExp);
      case 'PIPE':
      case 'IS':
      case 'ASSIGN':
      case 'AND':
      case 'OR':
      case 'EQ':
      case 'NE':
      case 'GT':
      case 'LT':
      case 'GE':
      case 'LE':
      case 'IN':
      case 'NI':
      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
      case 'MOD':
        return this.formatBinary(expression as BinaryExp);
      case 'IF':
        return this.formatTernary(expression as IfExp);
      case 'SEQ':
        return this.formatSeq(expression as SeqExp);
      default:
        return '';
    }
  }

  private formatNot({ argument }: NotExp) {
    return `${expTokenOperators['NOT']} ${this.formatExp(argument)}`;
  }

  private formatId({ value, path, args }: IdExp) {
    let s = value;

    if (path) {
      s += path.map((p) => `.${p.value}`).join('');
    }

    if (args) {
      s += this.formatSeq({ elements: args } as SeqExp);
    }

    return s;
  }

  private formatLit({ value }: LitExp) {
    return value === undefined ? 'undefined' : JSON.stringify(value);
  }

  private formatSeq({ elements }: SeqExp) {
    return `(${elements.map((element) => this.formatExp(element)).join(', ')})`;
  }

  private formatBinary({ type, left, right }: BinaryExp) {
    return `${this.formatExp(left)} ${expTokenOperators[type]} ${this.formatExp(right)}`;
  }

  private formatTernary({ test, consequent, alternative }: IfExp) {
    return `${this.formatExp(consequent)} ${expTokenOperators['IF']} ${this.formatExp(test)}${alternative ? ` ${expTokenOperators['ELSE']} ${this.formatExp(alternative)}` : ''}`;
  }
}
