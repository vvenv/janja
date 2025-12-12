import type { BinaryExp, Exp, IdExp } from '../../exp/exp-types';
import { type SyntaxNode, Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export type MacroNodeVal = IdExp<IdExp | BinaryExp<'ASSIGN', IdExp, Exp>>;

export class MacroNode extends Traversal {
  readonly type = 'MACRO';

  constructor(
    public readonly val: MacroNodeVal,
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class CallerNode extends Traversal {
  readonly type = 'CALLER';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
