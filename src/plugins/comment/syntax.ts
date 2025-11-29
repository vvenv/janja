import { type SyntaxNode, Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class CommentNode extends Traversal implements SyntaxNode {
  readonly type = 'COMMENT';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
