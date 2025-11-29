import { IdExp } from '../../exp/exp-types';
import { SyntaxNode, Traversal } from '../../syntax-nodes';
import { Loc, Strip } from '../../types';

export class BlockNode extends Traversal {
  readonly type = 'BLOCK';

  constructor(
    public readonly val: IdExp,
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class SuperNode extends Traversal {
  readonly type = 'SUPER';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
