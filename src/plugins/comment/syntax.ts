import { Traversal } from '../../syntax-nodes';
import { Loc, Strip } from '../../types';

export class CommentNode extends Traversal {
  readonly type = 'COMMENT';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
