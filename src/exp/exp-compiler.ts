import { CONTEXT, FILTERS } from '../param-names';
import type {
  BinaryExp,
  Exp,
  IdExp,
  IfExp,
  LitExp,
  NotExp,
  PipeExp,
  SeqExp,
} from '../types';
import { expTokenOperators } from './exp-token-operators';

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
        return this.compileNot(expression);
      case 'ID':
        return this.compileId(expression);
      case 'LIT':
        return this.compileLit(expression);
      case 'PIPE':
        return this.compilePipe(expression);
      case 'OF':
        return this.compileOf(expression);
      case 'SET':
        return this.compileSet(expression);
      case 'IS':
        return this.compileIs(expression);
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
        return this.compileBinary(expression);
      case 'IF':
        return this.compileTernary(expression);
      case 'SEQ':
        return this.compileSeq(expression);
      default:
        return '';
    }
  }

  private compileNot({ argument }: NotExp) {
    return `!${this.compileExp(argument)}`;
  }

  private compileId({ value, path, args }: IdExp) {
    let s = `${this.context}.${value}`;

    if (path) {
      s += path.map((p) => `.${p.value}`).join('');
    }

    if (args) {
      s += `(${args.map((arg) => this.compileExp(arg)).join(',')})`;
    }

    return s;
  }

  private compileLit({ value }: LitExp) {
    return value === undefined ? 'undefined' : JSON.stringify(value);
  }

  private compileSeq({ elements }: SeqExp) {
    return elements.map((element) => this.compileExp(element)).toString();
  }

  private compilePipe({ left, right }: PipeExp) {
    const { value: name, args = [] } = right as IdExp;

    return `(await ${this.filters}.${name}.call(${[this.context, this.compileExp(left), ...args.map((arg) => (arg.type === 'SET' ? `${this.context}.${((arg as BinaryExp).left as IdExp).value}=${this.compileExp(arg.right)}` : this.compileExp(arg)))].join(',')}))`;
  }

  private compileOf({ left, right }: BinaryExp) {
    // destructuring
    if (left.type === 'SEQ') {
      return `const {${(left.elements as IdExp[]).map(({ value }) => value).join(',')}} of ${this.compileExp(right)}`;
    }

    return `const ${(left as IdExp).value} of ${this.compileExp(right)}`;
  }

  private compileSet({ left, right }: BinaryExp) {
    if (left.type === 'ID') {
      return `Object.assign(${this.context},{${(left as IdExp).value}:${this.compileExp(right)}});`;
    }

    // destructuring
    return `Object.assign(${this.context},${this.filters}.pick.call(${this.context},${this.compileExp(right)},[${((left as SeqExp).elements as IdExp[]).map(({ value }) => `"${value}"`).join(',')}]));`;
  }

  private compileIs({ left, right }: BinaryExp) {
    return `(typeof ${this.compileExp(left)}===${this.compileExp(right)})`;
  }

  private compileBinary({ type, left, right }: BinaryExp) {
    const ret = `${this.compileExp(left)}${expTokenOperators[type]}${this.compileExp(right)}`;

    return type === 'NI' ? `!${ret}` : ret;
  }

  private compileTernary({ test, consequent, alternative }: IfExp) {
    return `(${this.compileExp(test)}?${this.compileExp(consequent)}:${alternative ? this.compileExp(alternative) : '""'})`;
  }
}
