import type { Loc } from '@jj/utils'

export type TokenType
  = | 'AND'
    | 'OR'
    | 'NOT'
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
    | 'IF'
    | 'ELSE'
    | 'SET'
    | 'LP'
    | 'RP'
    | 'COMMA'
    | 'STR'
    | 'NUM'
    | 'BOOL'
    | 'ID'

export interface Token<T = TokenType> extends Loc {
  type: T
  value: string | number | boolean | null | undefined
  raw?: string
}

export type Checker = (token: Token) => 'BACK' | 'BREAK' | undefined

export type ExpType
  = | 'AND'
    | 'OR'
    | 'NOT'
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
    | 'IF'
    | 'SET'
    | 'SEQ'
    | 'STR'
    | 'NUM'
    | 'BOOL'
    | 'ID'

export interface BaseExp extends Loc {
  type: ExpType
}

export interface IdExp extends BaseExp {
  type: 'ID'
  value: string
  args?: Exp[]
}

export interface StrExp extends BaseExp {
  type: 'STR'
  value: string
}

export interface NumExp extends BaseExp {
  type: 'NUM'
  value: number
}

export interface BoolExp extends BaseExp {
  type: 'BOOL'
  value: boolean
}

export interface NotExp extends BaseExp {
  type: 'NOT'
  argument: Exp
}

export interface BinaryExp extends BaseExp {
  type: 'AND'
    | 'OR'
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
    | 'SET'
  left: Exp
  right: Exp
}

export interface IfExp extends BaseExp {
  type: 'IF'
  test: Exp
  consequent: Exp
  alternative?: Exp
}

export interface PipeExp extends BaseExp {
  type: 'PIPE'
  left: Exp
  right: Exp
}

export interface SeqExp extends BaseExp {
  type: 'SEQ'
  elements: Exp[]
}

export type Exp
  = | IdExp
    | StrExp
    | NumExp
    | BoolExp
    | NotExp
    | BinaryExp
    | IfExp
    | PipeExp
    | SeqExp
