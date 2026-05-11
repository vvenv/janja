import { ExpParser } from '../../exp/exp-parser';
import type { Exp } from '../../exp/exp-types';
import { type SyntaxNode, Traversal } from '../../syntax-nodes';
import type { Loc, Strip } from '../../types';

export class WithNode extends Traversal {
  readonly type = 'WITH';

  constructor(
    public readonly expression: Exp,
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }

  traverse(cb: (node: SyntaxNode) => void) {
    this.body?.forEach(cb);
  }
}

export const syntax = {
  WITH: (token: any): WithNode => {
    const expParser = new ExpParser();
    const expression = expParser.parse(token.val, token.loc);

    if (!expression) {
      throw new Error('WITH directive requires a valid expression');
    }

    return new WithNode(expression, [], token.loc, token.strip);
  },
};
