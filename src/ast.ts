import type {
  BinaryExp,
  Exp,
  IdExp,
  LitExp,
  Loc,
  Strip,
} from './types'

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
  type: NodeType
  loc: Loc
}

export class TemplateNode implements ASTNode {
  readonly type = NodeType.TEMPLATE
  constructor(
    public children: ASTNode[],
    public loc: Loc,
  ) { }
}

export class OutputNode implements ASTNode {
  readonly type = NodeType.OUTPUT
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
    public exp: Exp,
  ) { }
}

export class TextNode implements ASTNode {
  readonly type = NodeType.TEXT
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class IfNode implements ASTNode {
  readonly type = NodeType.IF
  constructor(
    public test: Exp,
    public body: ASTNode[],
    public alternatives: (ElseIfNode | ElseNode)[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class ElseIfNode implements ASTNode {
  readonly type = NodeType.ELSE_IF
  constructor(
    public test: Exp,
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class ElseNode implements ASTNode {
  readonly type = NodeType.ELSE
  constructor(
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class ForNode implements ASTNode {
  readonly type = NodeType.FOR
  constructor(
    public loop: BinaryExp<'OF'>,
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class BreakNode implements ASTNode {
  readonly type = NodeType.BREAK
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class ContinueNode implements ASTNode {
  readonly type = NodeType.CONTINUE
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class UnknownDirectiveNode implements ASTNode {
  readonly type = NodeType.UNKNOWN
  constructor(
    public name: string,
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class UnexpectedDirectiveNode implements ASTNode {
  readonly type = NodeType.UNEXPECTED
  constructor(
    public name: string,
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class CommentNode implements ASTNode {
  readonly type = NodeType.COMMENT
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class IncludeNode implements ASTNode {
  readonly type = NodeType.INCLUDE
  constructor(
    public val: LitExp<string>,
    public loc: Loc,
    public strip: Strip,
  ) {
  }
}

export class BlockNode implements ASTNode {
  readonly type = NodeType.BLOCK
  constructor(
    public val: IdExp,
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class SuperNode implements ASTNode {
  readonly type = NodeType.SUPER
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class MacroNode implements ASTNode {
  readonly type = NodeType.MACRO
  constructor(
    public val: BinaryExp<'SET'>,
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class CallerNode implements ASTNode {
  readonly type = NodeType.CALLER
  constructor(
    public val: string,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class CallNode implements ASTNode {
  readonly type = NodeType.CALL
  constructor(
    public val: IdExp,
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class SetNode implements ASTNode {
  readonly type = NodeType.SET
  constructor(
    public val: BinaryExp<'SET'>,
    public loc: Loc,
    public strip: Strip,
  ) { }
}

export class CaptureNode implements ASTNode {
  readonly type = NodeType.CAPTURE
  constructor(
    public val: IdExp,
    public body: ASTNode[],
    public loc: Loc,
    public strip: Strip,
  ) { }
}
