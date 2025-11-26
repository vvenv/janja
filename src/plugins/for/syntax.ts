import { SyntaxNode, Traversal } from '../../syntax-nodes';
import { BinaryExp, Loc, Strip } from '../../types';

export class ForNode extends Traversal {
  readonly type = 'FOR';

  constructor(
    public readonly loop: BinaryExp<'OF'>,
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
