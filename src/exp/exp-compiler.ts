import { CONTEXT, FILTERS } from '../param-names';
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
      case 'OF':
        return this.compileOf(
          expression as BinaryExp<
            'OF',
            IdExp | SeqExp<IdExp | BinaryExp<'ASSIGN', IdExp, Exp>>,
            Exp
          >,
        );
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

  private compilePipe({ left, right }: BinaryExp<'PIPE'>) {
    const { value: name, args = [] } = right as IdExp;

    return `(await ${this.filters}.${name}.call(${[this.context, this.compileExp(left), ...args.map((arg) => (arg.type === 'ASSIGN' ? `${this.context}.${((arg as BinaryExp).left as IdExp).value}=${this.compileExp(arg.right)}` : this.compileExp(arg)))].join(',')}))`;
  }

  private compileOf({
    left,
    right,
  }: BinaryExp<
    'OF',
    IdExp | SeqExp<IdExp | BinaryExp<'ASSIGN', IdExp, Exp>>,
    Exp
  >) {
    // destructuring
    if (left.type === 'SEQ') {
      return `const {${left.elements
        .map((el) =>
          el.type === 'ASSIGN'
            ? `${el.left.value}=${this.compileExp(el.right)}`
            : el.value,
        )
        .join(',')}} of ${this.compileExp(right)}`;
    }

    return `const ${left.value} of ${this.compileExp(right)}`;
  }

  private compileAssign({ left, right }: BinaryExp<'ASSIGN'>) {
    if (left.type === 'ID') {
      return `Object.assign(${this.context},{${(left as IdExp).value}:${this.compileExp(right)}});`;
    }

    // destructuring
    return `Object.assign(${this.context},${this.filters}.pick.call(${this.context},${this.compileExp(right)},[${((left as SeqExp).elements as IdExp[]).map(({ value }) => `"${value}"`).join(',')}]));`;
  }

  private compileIs({ left, right }: BinaryExp<'IS'>) {
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
