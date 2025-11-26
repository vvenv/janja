import { Traversal } from '../../syntax-nodes';
import { BinaryExp, Loc, Strip } from '../../types';

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
