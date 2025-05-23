import { ASTError } from './ast-error';
import { ENDROOT, ROOT } from './config';
import { Location } from './source-map';
import { Tag, EngineOptions } from './types';
import { parseStatement, Statement } from './utils/parse-statement';

export interface BaseTag extends Location {
  stripBefore: boolean;
  stripAfter: boolean;
}

export interface EndTag extends BaseTag {
  name: string;
  prev: StartTag;
  next: null;
}

export interface StartTag extends BaseTag {
  name: string;
  rawStatement?: string;
  statement?: Statement[];
  node: ASTNode;
  prev: StartTag | null;
  next: StartTag | EndTag | null;
  children: ASTNode[];
}

export interface ASTNode {
  tags: [...StartTag[], EndTag];
  parent: ASTNode | null;
  prev: ASTNode | null;
  next: ASTNode | null;
  level: number;
  index: number;
}

export class AST implements ASTNode {
  template = '';
  /**
   * Current active node while parsing
   */
  current: ASTNode;
  /**
   * Current tag cursor while consuming
   */
  cursor!: StartTag | EndTag;
  nextTag: string | null = null;

  tags: [StartTag, EndTag];
  parent: null;
  prev: null;
  next: null;
  level: number;
  index: number;

  constructor(public options: EngineOptions) {
    this.tags = [] as unknown as [StartTag, EndTag];
    this.parent = null;
    this.prev = null;
    this.next = null;
    this.level = 0;
    this.index = 0;

    this.current = this;
  }

  get valid() {
    return this.tags.length % 2 === 0;
  }

  get children() {
    return this.tags[0]?.children ?? [];
  }

  parse(template: string, tags: Tag[]) {
    this.template = template;
    const { start, end } = this.options;

    this.cursor = this.start({
      name: ROOT,
      startIndex: 0,
      endIndex: 0,
    })!;

    const tagRe = new RegExp(`${start}(-)?\\s(.+?)\\s(-)?${end}`, 'gms');
    let match;
    while ((match = tagRe.exec(template))) {
      const base = this.baseTag(match);
      for (const tag of tags) {
        if (tag.parse.call(this, base, match[2], match[0]) !== false) {
          break;
        }
      }
    }

    this.end({
      name: ENDROOT,
      startIndex: template.length,
      endIndex: template.length,
    });

    return this;
  }

  parseStatement(tag: Partial<StartTag> & Location) {
    if (tag.rawStatement) {
      tag.statement = parseStatement(tag.rawStatement);
    }
    return tag;
  }

  baseTag(match: RegExpExecArray): BaseTag {
    return {
      stripBefore: match[1] === '-',
      stripAfter: match[3] === '-',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    };
  }

  goto(tag: StartTag | EndTag) {
    this.cursor = tag;
  }

  start(tag: Partial<StartTag> & Location) {
    if (!this.verifyNextTag(tag)) {
      return;
    }

    this.nextTag = null;

    const { tags } = this.current;

    const startTag = {
      ...this.parseStatement(tag),
      prev: null,
      next: null,
      children: [],
    } as StartTag;

    // []
    if (tags.length === 0) {
      startTag.node = this.current;
      tags.push(startTag);
      return startTag;
    }

    // [...StartTag]
    const lastTag = tags.at(-1) as StartTag;
    const lastBlock = lastTag.children.at(-1) ?? null;

    const node: ASTNode = {
      tags: [startTag] as unknown as [StartTag, EndTag],
      parent: this.current,
      prev: lastBlock ?? null,
      next: null,
      level: this.current.level + 1,
      index: lastTag.children.length,
    };

    if (lastBlock) {
      lastBlock.next = node;
    }
    startTag.node = node;
    lastTag.children.push(node);
    this.current = node as ASTNode;

    return startTag;
  }

  between(tag: Partial<StartTag> & Location) {
    if (!this.verifyNextTag(tag)) {
      return;
    }

    this.nextTag = null;

    const { tags } = this.current;

    // For testing purposes
    if (!tags.length) {
      return;
    }

    const lastTag = tags.at(-1) as StartTag;
    const _tag = {
      ...this.parseStatement(tag),
      node: lastTag.node,
      prev: lastTag,
      next: null,
      children: [],
    } as StartTag;

    lastTag.next = _tag;
    tags.push(_tag);

    return _tag;
  }

  end(tag: Partial<EndTag> & Location) {
    if (!this.verifyNextTag(tag)) {
      return;
    }

    this.nextTag = null;

    const { tags } = this.current;

    // For testing purposes
    if (!tags.length) {
      return;
    }

    const lastTag = tags.at(-1) as StartTag;
    const _tag = {
      ...tag,
      prev: lastTag,
      next: null,
    } as EndTag;

    lastTag.next = _tag;
    tags.push(_tag);

    // It's a close block, so we need to move the cursor to the parent
    this.current = this.current.parent ?? this;

    return _tag;
  }

  verifyNextTag(tag: Partial<StartTag | EndTag> & Location) {
    if (!this.nextTag || tag.name === this.nextTag) {
      return true;
    }
    if (this.options.debug) {
      throw new ASTError(`expect "${this.nextTag}", "${tag.name}" found.`, {
        template: this.template,
        tags: [tag],
      });
    }
    return false;
  }

  verifyFirstTag(
    name: string,
    tag: Partial<StartTag | EndTag> & Location,
    required = true,
  ) {
    if (!this.verifyNextTag(tag)) {
      return true;
    }
    const firstTag = this.current.tags.at(0)!;
    if (firstTag.name === name) {
      return true;
    }
    if (required && this.options.debug) {
      throw new ASTError(
        `"${tag.name}" must follow "${name}", not "${firstTag.name}".`,
        {
          template: this.template,
          tags: [firstTag, tag],
        },
      );
    }
    return false;
  }

  verifyStartTag(name: string, tag: Partial<StartTag | EndTag> & Location) {
    if (!this.verifyNextTag(tag)) {
      return true;
    }
    let node = this.current;
    while (node) {
      if (node.tags.at(0)!.name === name) {
        return true;
      }
      node = node.parent!;
    }
    if (this.options.debug) {
      throw new ASTError(`"${tag.name}" must be a descendant of "${name}".`, {
        template: this.template,
        tags: [tag],
      });
    }
    return false;
  }

  getNextTag(tag: StartTag) {
    return tag.children[0]?.tags[0] ?? tag.next;
  }
}
