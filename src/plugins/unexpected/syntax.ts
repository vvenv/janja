import { Traversal } from '../../syntax-nodes';
import { Loc, Strip } from '../../types';

export class UnexpectedNode extends Traversal {
  readonly type = 'unexpected';

  constructor(
    public readonly name: string,
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
