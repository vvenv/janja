import { Loc, Primitive } from '../types';

export type UnaryExpTokenType = 'NOT';
export type BinaryExpTokenType =
  | 'AND'
  | 'OR'
  | 'IS'
  | 'EQ'
  | 'NE'
  | 'GT'
  | 'LT'
  | 'GE'
  | 'LE'
  | 'IN'
  | 'NI'
  | 'OF'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'MOD'
  | 'PIPE'
  | 'ASSIGN';
export type TernaryExpTokenType = 'IF' | 'ELSE';
export type ExpTokenType =
  | UnaryExpTokenType
  | BinaryExpTokenType
  | TernaryExpTokenType
  | 'LP'
  | 'RP'
  | 'COMMA'
  | 'DOT'
  | 'ID'
  | 'LIT';

export type UnaryExpType = UnaryExpTokenType;
export type BinaryExpType = BinaryExpTokenType;
export type TernaryExpType = TernaryExpTokenType;
export type ExpType =
  | UnaryExpType
  | BinaryExpType
  | TernaryExpType
  | 'SEQ'
  | 'ID'
  | 'LIT';

export interface ExpBase<T = ExpType> {
  type: T;
  loc: Loc;
}

export interface NotExp extends ExpBase<'NOT'> {
  argument: Exp;
}

export interface BinaryExp<
  T extends BinaryExpType = BinaryExpType,
  U extends Exp = Exp,
  V extends Exp = Exp,
> extends ExpBase<T> {
  left: U;
  right: V;
}

export interface IfExp extends ExpBase<'IF'> {
  test: Exp;
  consequent: Exp;
  alternative?: Exp;
}

export interface IdExp extends ExpBase<'ID'> {
  value: string;
  path?: IdExp[];
  args?: Exp[];
}

export interface LitExp<T = Primitive> extends ExpBase<'LIT'> {
  value: T;
}

export interface SeqExp<T extends Exp = Exp> extends ExpBase<'SEQ'> {
  elements: T[];
}

export type Exp = NotExp | BinaryExp | IfExp | IdExp | LitExp | SeqExp;
