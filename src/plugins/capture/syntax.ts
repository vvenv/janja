import type { IdExp } from '../../exp/exp-types';
import { type SyntaxNode, Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class CaptureNode extends Traversal {
  readonly type = 'CAPTURE';

  constructor(
    public readonly val: IdExp,
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
