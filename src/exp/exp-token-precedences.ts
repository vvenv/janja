import type { ExpTokenType } from '../types';

export const expTokenPrecedences: Record<ExpTokenType, number> = {
  COMMA: 5,

  IF: 10,
  ELSE: 10,

  SET: 15,

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
