import type { BinaryExp } from '../../exp/exp-types';
import { Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class SetNode extends Traversal {
  readonly type = 'SET';

  constructor(
    public readonly val: BinaryExp<'ASSIGN'>,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
