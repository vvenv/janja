import type { BinaryExp, Exp, IdExp, LitExp, Loc, Strip } from './types';

export enum NodeType {
  TEMPLATE = 'TEMPLATE',
  COMMENT = 'COMMENT',
  OUTPUT = 'OUTPUT',
  TEXT = 'TEXT',
  IF = 'IF',
  ELSE = 'ELSE',
  ELSE_IF = 'ELSE_IF',
  FOR = 'FOR',
  BREAK = 'BREAK',
  CONTINUE = 'CONTINUE',
  EXP = 'EXP',
  INCLUDE = 'INCLUDE',
  BLOCK = 'BLOCK',
  SUPER = 'SUPER',
  MACRO = 'MACRO',
  CALLER = 'CALLER',
  CALL = 'CALL',
  SET = 'SET',
  CAPTURE = 'CAPTURE',
  UNKNOWN = 'UNKNOWN',
  UNEXPECTED = 'UNEXPECTED',
}

export interface ASTNode {
  type: NodeType;
  loc: Loc;
  body?: ASTNode[];
  traverse: (cb: (node: ASTNode) => void) => void;
}

export class Traversal implements ASTNode {
  readonly type = null as unknown as NodeType;

  readonly loc = null as unknown as Loc;

  body?: ASTNode[];

  traverse(cb: (node: ASTNode) => void) {
    this.body?.forEach(cb);
  }
}

export class RootNode extends Traversal {
  readonly type = NodeType.TEMPLATE;

  constructor(
    public readonly body: ASTNode[],
    public readonly loc: Loc,
  ) {
    super();
  }
}

export class OutputNode extends Traversal {
  readonly type = NodeType.OUTPUT;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
    public readonly exp: Exp,
  ) {
    super();
  }
}

export class TextNode extends Traversal {
  readonly type = NodeType.TEXT;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class IfNode extends Traversal {
  readonly type = NodeType.IF;

  constructor(
    public readonly test: Exp,
    public readonly body: ASTNode[],
    public readonly alternatives: (ElseIfNode | ElseNode)[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }

  traverse(cb: (node: ASTNode) => void) {
    this.body?.forEach(cb);
    this.alternatives?.forEach((node) => node.body?.forEach(cb));
  }
}

export class ElseIfNode extends Traversal {
  readonly type = NodeType.ELSE_IF;

  constructor(
    public readonly test: Exp,
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class ElseNode extends Traversal {
  readonly type = NodeType.ELSE;

  constructor(
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class ForNode extends Traversal {
  readonly type = NodeType.FOR;

  constructor(
    public readonly loop: BinaryExp<'OF'>,
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class BreakNode extends Traversal {
  readonly type = NodeType.BREAK;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class ContinueNode extends Traversal {
  readonly type = NodeType.CONTINUE;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class UnknownDirectiveNode extends Traversal {
  readonly type = NodeType.UNKNOWN;

  constructor(
    public readonly name: string,
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class UnexpectedDirectiveNode extends Traversal {
  readonly type = NodeType.UNEXPECTED;

  constructor(
    public readonly name: string,
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class CommentNode extends Traversal {
  readonly type = NodeType.COMMENT;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class IncludeNode extends Traversal {
  readonly type = NodeType.INCLUDE;

  constructor(
    public readonly val: LitExp<string>,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class BlockNode extends Traversal {
  readonly type = NodeType.BLOCK;

  constructor(
    public readonly val: IdExp,
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class SuperNode extends Traversal {
  readonly type = NodeType.SUPER;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class MacroNode extends Traversal {
  readonly type = NodeType.MACRO;

  constructor(
    public readonly val: BinaryExp<'SET'>,
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class CallerNode extends Traversal {
  readonly type = NodeType.CALLER;

  constructor(
    public readonly val: string,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class CallNode extends Traversal {
  readonly type = NodeType.CALL;

  constructor(
    public readonly val: IdExp,
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class SetNode extends Traversal {
  readonly type = NodeType.SET;

  constructor(
    public readonly val: BinaryExp<'SET'>,
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}

export class CaptureNode extends Traversal {
  readonly type = NodeType.CAPTURE;

  constructor(
    public readonly val: IdExp,
    public readonly body: ASTNode[],
    public readonly loc: Loc,
    public readonly strip: Strip,
  ) {
    super();
  }
}
