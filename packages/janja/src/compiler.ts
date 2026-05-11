import type { LRUCache } from './cache';
import { CompileError } from './compile-error';
import { Context } from './context';
import { Parser } from './parser';
import type { BlockNode } from './plugins/block/syntax';
import type { IncludeNode } from './plugins/include/syntax';
import type { RootNode, SyntaxNode } from './syntax-nodes';
import type { CompilerFn, CompilerOptions } from './types';

export class Compiler extends Context {
  public template!: string;

  public state!: Record<string, any>;

  private isRoot!: boolean;

  private rootNode!: RootNode;

  private partials!: Map<string, string>;

  private blocks!: Map<string, BlockNode[]>;

  private cache?: LRUCache<string>;

  constructor(
    public options: Required<CompilerOptions>,
    cache?: LRUCache<string>,
  ) {
    super();
    this.cache = cache;
  }

  async compile(
    template: string,
    root = true,
    partials = new Map<string, string>(),
    blocks = new Map<string, BlockNode[]>(),
  ) {
    this.template = template;
    this.isRoot = root;
    this.partials = partials;
    this.blocks = blocks;

    // Generate cache key from template and options
    const cacheKey = this.generateCacheKey(template);

    // Check cache first
    if (this.cache && root) {
      const cachedCode = this.cache.get(cacheKey);

      if (cachedCode) {
        this.code = cachedCode;

        return this;
      }
    }

    this.rootNode = new Parser(this.options).parse(template);
    this.state = {};

    this.start();

    await this.parseTemplates();

    if (this.isRoot) {
      if (this.partials.size) {
        this.pushRaw(null, 'const p={');

        for (const [path, code] of this.partials) {
          this.pushRaw(null, `"${path}":async()=>{`, code, '},');
        }

        this.pushRaw(null, '};');
      }

      if (this.blocks.size) {
        this.pushRaw(null, 'const b={');

        for (const [name, _blocks] of this.blocks) {
          this.pushRaw(null, `"${name}":{`, 'u:0,', 's:[');

          this.state.block = name;

          for (const block of _blocks) {
            this.pushRaw(null, 'async()=>{', 'let s="";');
            await this.compileNodes(block.body);
            this.pushRaw(null, 'return s;', '},');
          }

          this.state.block = undefined;

          this.pushRaw(null, '],', '},');
        }

        this.pushRaw(null, '};');
      }
    }

    await this.compileNode(this.rootNode);

    this.end();

    // Store in cache
    if (this.cache && root) {
      this.cache.set(cacheKey, this.code);
    }

    return this;
  }

  private generateCacheKey(template: string): string {
    // Simple hash-based cache key
    let hash = 0;

    for (let i = 0; i < template.length; i++) {
      const char = template.charCodeAt(i);

      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return `${hash}:${this.options.trimWhitespace}:${this.options.stripComments}`;
  }

  private async parseTemplates() {
    const { partials, blocks } = this.collectPartialsAndBlocks();

    for (const [path, node] of partials) {
      if (!this.partials.has(path)) {
        let template: string | undefined;

        try {
          template = await this.options.loader(path);
        } catch {
          throw new CompileError(
            `Failed to load template from "${path}"`,
            this.template,
            node.loc,
          );
        }

        if (template) {
          await this.compilePartial(path, node, template);
        }
      }
    }

    for (const block of blocks) {
      const {
        val: { value },
      } = block;

      if (!this.blocks.has(value)) {
        this.blocks.set(value, []);
      }

      this.blocks.get(value)!.push(block);
    }
  }

  private collectPartialsAndBlocks() {
    const partials = new Map<string, IncludeNode>();
    const blocks: BlockNode[] = [];

    const traverse = (node: SyntaxNode) => {
      if (node.type === 'INCLUDE') {
        if (!partials.has((node as IncludeNode).val.value)) {
          partials.set((node as IncludeNode).val.value, node as IncludeNode);
        }
      }

      if (node.type === 'BLOCK') {
        blocks.push(node as BlockNode);
      }

      node.traverse(traverse);
    };

    traverse(this.rootNode);

    return {
      partials,
      blocks,
    };
  }

  private async compileNode(node: SyntaxNode) {
    if (node.type === 'TEMPLATE') {
      await this.compileNodes((node as RootNode).body);

      return;
    }

    let compiler = this.options.compilers[node.type];

    if (typeof compiler === 'string') {
      compiler = this.options.compilers[compiler];
    }

    if (!compiler) {
      compiler = this.options.compilers['UNKNOWN'];
    }

    await (compiler as CompilerFn)?.(node, this);
  }

  async compileNodes(nodes: SyntaxNode[]) {
    for (const child of nodes) {
      await this.compileNode(child);
    }
  }

  private async compilePartial(
    path: string,
    node: IncludeNode,
    template: string,
  ) {
    try {
      const { code } = await new Compiler(this.options).compile(
        template,
        false,
        this.partials,
        this.blocks,
      );

      this.partials.set(path, code);
    } catch {
      this.options.debug(
        new CompileError('Failed to compile template', this.template, node.loc),
      );
    }
  }
}
