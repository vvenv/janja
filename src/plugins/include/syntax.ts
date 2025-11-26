import { Traversal } from '../../syntax-nodes';
import { LitExp, Loc, Strip } from '../../types';

export class IncludeNode extends Traversal {
  readonly type = 'INCLUDE';

  constructor(
    public readonly val: LitExp<string>,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
