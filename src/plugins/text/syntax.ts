import { Traversal } from '../../syntax-nodes';
import { Loc, Strip } from '../../types';

export class TextNode extends Traversal {
  readonly type = 'TEXT';

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
