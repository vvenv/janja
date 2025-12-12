import type { BinaryExp, Exp, IdExp, SeqExp } from '../../exp/exp-types';
import { type SyntaxNode, Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class ForNode extends Traversal {
  readonly type = 'FOR';

  constructor(
    public readonly loop: BinaryExp<
      'OF',
      IdExp | SeqExp<IdExp | BinaryExp<'ASSIGN', IdExp, Exp>>,
      Exp
    >,
    public readonly body: SyntaxNode[],
    public readonly alternative: ElseNode | null,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class ElseNode extends Traversal {
  readonly type = 'ELSE';

  constructor(
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class BreakNode extends Traversal {
  readonly type = 'BREAK';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class ContinueNode extends Traversal {
  readonly type = 'CONTINUE';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
