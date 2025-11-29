import type { Exp } from '../../exp/exp-types';
import { Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class OutputNode extends Traversal {
  readonly type = 'OUTPUT';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
    public readonly exp: Exp,
  ) {
    super();
  }
}
