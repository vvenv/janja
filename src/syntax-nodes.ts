import type { Loc, Strip } from './types';

export interface SyntaxNode {
  type: string;
  loc: Loc;
  body?: SyntaxNode[];
  traverse: (cb: (node: SyntaxNode) => void) => void;
}

export class Traversal implements SyntaxNode {
  readonly type = null as unknown as string;

  readonly loc = null as unknown as Loc;

  body?: SyntaxNode[];

  traverse(cb: (node: SyntaxNode) => void) {
    this.body?.forEach(cb);
  }
}

export class RootNode extends Traversal {
  readonly type = 'TEMPLATE';

  constructor(
    public readonly body: SyntaxNode[],
    public readonly loc: Loc,
  ) {
    super();
  }
}

export class UnknownNode extends Traversal {
  readonly type = 'UNKNOWN';

  constructor(
    public readonly name: string,
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class UnexpectedNode extends Traversal {
  readonly type = 'UNEXPECTED';

  constructor(
    public readonly name: string,
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
