import { CONTEXT, FILTERS, RESULT, UNKNOWN_FILTER } from '../param-names';
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

const expTokenOperators: Record<ExpTokenType, string> = {
  AND: '&&',
  OR: '||',
  IS: '',
  NOT: '!',
  EQ: '===',
  NE: '!==',
  GT: '>',
  LT: '<',
  GE: '>=',
  LE: '<=',
  IN: ' in ',
  NI: ' in ',
  OF: ' of ',
  ADD: '+',
  SUB: '-',
  MUL: '*',
  DIV: '/',
  MOD: '%',
  PIPE: '',
  ASSIGN: '=',
  LP: '(',
  RP: ')',
  COMMA: ',',
  DOT: '.',
  ID: '',
  LIT: '',
  IF: '',
  ELSE: '',
};

// Names every object inherits (`toString`, `valueOf`, ...). The context is a
// plain object, so these are only read from it when it has them itself;
// otherwise a name nobody defined would resolve to a built-in function.
const inherited = new Set(Object.getOwnPropertyNames(Object.prototype));

export class ExpCompiler {
  private context!: string;

  private filters!: string;

  compile(expression: Exp | null, context = CONTEXT, filters = FILTERS) {
    this.context = context;
    this.filters = filters;

    return expression ? this.compileExp(expression) : '""';
  }

  private compileExp(expression: Exp): string {
    switch (expression.type) {
      case 'NOT':
        return this.compileNot(expression as NotExp);
      case 'ID':
        return this.compileId(expression as IdExp);
      case 'LIT':
        return this.compileLit(expression as LitExp);
      case 'PIPE':
        return this.compilePipe(expression as BinaryExp<'PIPE'>);
      case 'ASSIGN':
        return this.compileAssign(expression as BinaryExp<'ASSIGN'>);
      case 'IS':
        return this.compileIs(expression as BinaryExp<'IS'>);
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
        return this.compileBinary(expression as BinaryExp);
      case 'IF':
        return this.compileTernary(expression as IfExp);
      case 'SEQ':
        return this.compileSeq(expression as SeqExp);
      default:
        return '';
    }
  }

  private compileNot({ argument }: NotExp) {
    return `!${this.compileExp(argument)}`;
  }

  private compileId({ value, path, args }: IdExp) {
    let s = inherited.has(value)
      ? `(Object.hasOwn(${this.context},"${value}")?${this.context}.${value}:undefined)`
      : `${this.context}.${value}`;

    if (path) {
      s += path.map((p) => `.${p.value}`).join('');
    }

    if (args) {
      s += `(${this.compileArgs(args).join(',')})`;
    }

    return s;
  }

  /**
   * Positional arguments in the order they are written, followed by one
   * object holding the named ones: `f(1, a=2, b=3)` calls `f(1, {a:2,b:3})`.
   */
  private compileArgs(args: Exp[]) {
    const positional: string[] = [];
    const named: string[] = [];

    for (const arg of args) {
      if (arg.type === 'ASSIGN') {
        const { left, right } = arg as BinaryExp<'ASSIGN'>;

        named.push(`${(left as IdExp).value}:${this.compileExp(right)}`);
      } else {
        positional.push(this.compileExp(arg));
      }
    }

    if (named.length) {
      positional.push(`{${named.join(',')}}`);
    }

    return positional;
  }

  private compileLit({ value }: LitExp) {
    if (value === undefined) {
      return 'undefined';
    }

    // Parenthesised, or `a - -1` would compile to the decrement `a--1`
    if (typeof value === 'number' && value < 0) {
      return `(${value})`;
    }

    return JSON.stringify(value);
  }

  private compileSeq({ elements }: SeqExp) {
    // Parenthesised, so that grouping survives: `(a + b) * 2`
    return `(${elements.map((element) => this.compileExp(element)).join(',')})`;
  }

  private compilePipe({ left, right }: BinaryExp<'PIPE'>) {
    const { value: name, args = [] } = right as IdExp;

    const call = `(${this.filters}.${name}||${UNKNOWN_FILTER}("${name}")).call(${[this.context, this.compileExp(left), ...this.compileArgs(args)].join(',')})`;

    // Awaiting a plain value still costs a trip through the microtask queue,
    // so only promises returned by async filters are awaited
    return `(${RESULT}=${call},${RESULT} instanceof Promise?await ${RESULT}:${RESULT})`;
  }

  private compileAssign({ left, right }: BinaryExp<'ASSIGN'>) {
    if (left.type === 'ID') {
      return `Object.assign(${this.context},{${(left as IdExp).value}:${this.compileExp(right)}});`;
    }

    // destructuring
    return `Object.assign(${this.context},${this.filters}.pick.call(${this.context},${this.compileExp(right)},${((left as SeqExp).elements as IdExp[]).map(({ value }) => `"${value}"`).join(',')}));`;
  }

  private compileIs({ left, right }: BinaryExp<'IS'>) {
    return `typeof ${this.compileExp(left)}===${this.compileExp(right)}`;
  }

  private compileBinary({ type, left, right }: BinaryExp) {
    const ret = `${this.compileExp(left)}${expTokenOperators[type]}${this.compileExp(right)}`;

    return type === 'NI' ? `!(${ret})` : ret;
  }

  private compileTernary({ test, consequent, alternative }: IfExp) {
    return `${this.compileExp(test)}?${this.compileExp(consequent)}:${alternative ? this.compileExp(alternative) : '""'}`;
  }
}
