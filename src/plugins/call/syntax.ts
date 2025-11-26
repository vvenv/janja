import { SyntaxNode, Traversal } from '../../syntax-nodes';
import { IdExp, Loc, Strip } from '../../types';

export class CallNode extends Traversal {
  readonly type = 'CALL';

  constructor(
    public readonly val: IdExp,
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
