import type { Exp } from '../../exp/exp-types';
import { Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class OutputNode extends Traversal {
  readonly type = 'OUTPUT';

  constructor(
    public readonly val: Exp,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
