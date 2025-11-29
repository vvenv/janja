import type { BinaryExp, Exp, IdExp, SeqExp } from '../../exp/exp-types';
import { type SyntaxNode, Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class MacroNode extends Traversal {
  readonly type = 'MACRO';

  constructor(
    public readonly val: BinaryExp<
      'ASSIGN',
      IdExp,
      SeqExp<IdExp | BinaryExp<'ASSIGN', IdExp, Exp>>
    >,
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
