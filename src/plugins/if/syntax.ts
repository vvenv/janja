import { Exp } from '../../exp/exp-types';
import { SyntaxNode, Traversal } from '../../syntax-nodes';
import { Loc, Strip } from '../../types';

export class IfNode extends Traversal {
  readonly type = 'IF';

  constructor(
    public readonly test: Exp,
    public readonly body: SyntaxNode[],
    public readonly alternatives: (ElseIfNode | ElseNode)[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }

  traverse(cb: (node: SyntaxNode) => void) {
    this.body?.forEach(cb);
    this.alternatives?.forEach((node) => node.body?.forEach(cb));
  }
}

export class ElseIfNode extends Traversal {
  readonly type = 'ELSE_IF';

  constructor(
    public readonly test: Exp,
    public readonly body: SyntaxNode[],
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
