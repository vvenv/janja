import { CompileError } from '../compile-error';
import type { Loc, Pos } from '../types';
import { ExpToken, ExpTokenizer } from './exp-tokenizer';
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

export type Checker = (token: ExpToken) => 'BACK' | 'BREAK' | undefined;

const expTokenPrecedences: Record<ExpTokenType, number> = {
  COMMA: 5,

  IF: 10,
  ELSE: 10,

  ASSIGN: 15,

  LP: 20,
  RP: 20,

  OR: 25,

  AND: 30,

  IS: 40,
  EQ: 40,
  NE: 40,
  GT: 40,
  LT: 40,
  GE: 40,
  LE: 40,
  IN: 40,
  NI: 40,
  OF: 40,

  ADD: 50,
  SUB: 50,

  MUL: 60,
  DIV: 60,
  MOD: 60,

  NOT: 70,

  PIPE: 80,

  DOT: 90,
  ID: 90,
  LIT: 90,
};

export class ExpParser implements Pos {
  val = '';

  tokens: ExpToken[] = [];

  index = 0;

  line = 1;

  column = 1;

  constructor(private readonly template: string) {}

  parse(val: string, loc: Loc) {
    this.val = val;
    this.index = 0;
    this.line = loc.start.line;
    this.column = loc.start.column;
    this.tokens = new ExpTokenizer(this.template).tokenize(val, loc);

    return this.val ? this.parseExp() : null;
  }

  private parseExp(checker?: Checker): Exp | null {
    let left: Exp | null = null;

    while (true) {
      const token = this.next();

      if (!token) {
        break;
      }

      const check = checker?.(token);

      if (check === 'BACK') {
        this.back();

        break;
      }

      if (check === 'BREAK') {
        break;
      }

      if (token.type === 'LP') {
        if (!this.peek()) {
          throw new CompileError(
            'unexpected end of expression',
            this.template,
            token.loc,
          );
        }

        const elements = this.parseSequence();

        const rp = this.consume('RP');

        if (!rp) {
          throw new CompileError(
            'expected "RP" after "LP"',
            this.template,
            token.loc,
          );
        }

        left = {
          ...token,
          type: 'SEQ',
          elements,
          loc: {
            start: token.loc.start,
            end: rp.loc.end,
          },
        } satisfies SeqExp;

        continue;
      }

      if (token.type === 'NOT') {
        if (!this.peek()) {
          throw new CompileError(
            'unexpected end of expression',
            this.template,
            token.loc,
          );
        }

        left = {
          ...token,
          type: 'NOT',
          argument: this.parseExp((t) =>
            isHigher(token, t) ? 'BACK' : undefined,
          )!,
        } satisfies NotExp;

        continue;
      }

      if (token.type === 'ID') {
        left = {
          ...token,
          type: 'ID',
          value: token.value as string,
        } satisfies IdExp;

        if (this.match('DOT')) {
          left.path = this.parsePath();
        }

        const lp = this.consume('LP');

        if (lp) {
          left.args = this.parseSequence();

          if (!this.consume('RP')) {
            throw new CompileError(
              'expected "RP" after "LP"',
              this.template,
              lp.loc,
            );
          }

          continue;
        }

        continue;
      }

      if (token.type === 'LIT') {
        left = {
          ...token,
          type: 'LIT',
        } satisfies LitExp;

        continue;
      }

      if (token.type === 'IF') {
        const test = this.parseExp((t) =>
          t.type === 'ELSE' ? 'BACK' : isHigher(token, t) ? 'BACK' : undefined,
        );

        if (!test) {
          throw new CompileError(
            'expected test expression',
            this.template,
            token.loc,
          );
        }

        left = {
          ...token,
          type: 'IF',
          test,
          consequent: left!,
        } satisfies IfExp;

        if (this.consume('ELSE')) {
          const alternative = this.parseExp((t) =>
            isHigher(token, t) ? 'BACK' : undefined,
          );

          if (!alternative) {
            throw new CompileError(
              'expected alternative expression',
              this.template,
              token.loc,
            );
          }

          (left as IfExp).alternative = alternative;
        }

        continue;
      }

      if (
        token.type === 'AND' ||
        token.type === 'OR' ||
        token.type === 'IS' ||
        token.type === 'EQ' ||
        token.type === 'NE' ||
        token.type === 'GT' ||
        token.type === 'LT' ||
        token.type === 'GE' ||
        token.type === 'LE' ||
        token.type === 'IN' ||
        token.type === 'NI' ||
        token.type === 'OF' ||
        token.type === 'ADD' ||
        token.type === 'SUB' ||
        token.type === 'MUL' ||
        token.type === 'DIV' ||
        token.type === 'MOD' ||
        token.type === 'ASSIGN'
      ) {
        if (!left) {
          throw new CompileError(
            `no left operand for "${token.type}"`,
            this.template,
            token.loc,
          );
        }

        const right = this.parseExp((t) =>
          isHigher(token, t) ? 'BACK' : undefined,
        );

        if (!right) {
          throw new CompileError(
            `no right operand for "${token.type}"`,
            this.template,
            token.loc,
          );
        }

        left = {
          ...token,
          type: token.type,
          left,
          right,
        } satisfies BinaryExp;

        continue;
      }

      if (token.type === 'PIPE') {
        if (!left) {
          throw new CompileError(
            `no left operand for "${token.type}"`,
            this.template,
            token.loc,
          );
        }

        if (!this.match('ID')) {
          throw new CompileError(
            'expected "ID" after "PIPE"',
            this.template,
            token.loc,
          );
        }

        left = {
          ...token,
          type: 'PIPE',
          left,
          right: this.parsePipe(),
        } satisfies BinaryExp<'PIPE'>;

        continue;
      }

      this.back();

      break;
    }

    return left;
  }

  private parsePath() {
    const ids: IdExp[] = [];

    while (true) {
      const dot = this.consume('DOT');

      if (!dot) {
        break;
      }

      const token = this.next();

      if (!token) {
        throw new CompileError(
          'expected "ID" after "DOT"',
          this.template,
          dot.loc,
        );
      }

      if (token.type !== 'ID') {
        throw new CompileError(
          'expected "ID" after "DOT"',
          this.template,
          dot.loc,
        );
      }

      ids.push({
        ...token,
        type: 'ID',
        value: token.value as string,
      } satisfies IdExp);
    }

    return ids;
  }

  private parseSequence() {
    const elements: Exp[] = [];

    while (!this.match('RP')) {
      const element = this.parseExp((t) =>
        t.type === 'COMMA' ? 'BREAK' : undefined,
      )!;

      if (element) {
        elements.push(element);
      } else {
        break;
      }
    }

    return elements;
  }

  private parsePipe() {
    const token = this.next()!;

    const right = {
      ...token,
      type: 'ID',
      value: token.value as string,
    } as IdExp;

    const lp = this.consume('LP');

    if (lp) {
      const args = this.parseSequence();

      if (args.length) {
        right.args = args;
      }

      if (!this.consume('RP')) {
        throw new CompileError(
          'expected "RP" after "LP"',
          this.template,
          lp.loc,
        );
      }
    }

    return right;
  }

  private next(): ExpToken | null {
    return this.tokens[this.index++] ?? null;
  }

  private back(): ExpToken {
    return this.tokens[this.index--];
  }

  private peek() {
    return this.tokens.at(this.index) ?? null;
  }

  private match(type: ExpTokenType) {
    return this.peek()?.type === type;
  }

  private consume(type: ExpTokenType) {
    if (this.match(type)) {
      return this.next();
    }
  }
}

function isHigher(a: ExpToken, b: ExpToken) {
  return expTokenPrecedences[a.type] > expTokenPrecedences[b.type];
}
