import type { LRUCache } from './cache';
import { CompileError } from './compile-error';
import { Context } from './context';
import { Parser } from './parser';
import type { BlockNode } from './plugins/block/syntax';
import type { IncludeNode } from './plugins/include/syntax';
import type { Mapping } from './source-map';
import type { RootNode, SyntaxNode } from './syntax-nodes';
import type { CompilerFn, CompilerOptions, Script } from './types';

export interface CompiledTemplate {
  code: string;
  mappings: Mapping[];
  // Created on first use and then shared by every render of the template
  script?: Script;
  // Source of every included template, to detect when one of them changed
  sources: Map<string, string>;
  // The options the template was compiled with
  fingerprint: string;
}

const fingerprints = new WeakMap<object, string>();

// How deep includes may nest while rendering. Only templates that include
// themselves get anywhere near it; the limit turns a cycle that never ends
// into an error instead of a stack overflow.
export const MAX_INCLUDE_DEPTH = 100;

// Directives whose body is still the template's own top-level output
const transparent = new Set(['IF', 'FOR']);

// The template itself is the key: one string that is hashed once, and two
// different templates can never share an entry
export function templateCacheKey(template: string, stream = false) {
  return stream ? `\0stream:${template}` : template;
}

export function optionsFingerprint(options: Required<CompilerOptions>) {
  let fingerprint = fingerprints.get(options);

  if (fingerprint === undefined) {
    const {
      trimWhitespace,
      stripComments,
      commentOpen,
      commentClose,
      directiveOpen,
      directiveClose,
      outputOpen,
      outputClose,
    } = options;

    fingerprint = JSON.stringify([
      trimWhitespace,
      stripComments,
      commentOpen,
      commentClose,
      directiveOpen,
      directiveClose,
      outputOpen,
      outputClose,
    ]);
    fingerprints.set(options, fingerprint);
  }

  return fingerprint;
}

export class Compiler extends Context {
  public template!: string;

  public state!: Record<string, any>;

  private isRoot!: boolean;

  private rootNode!: RootNode;

  private partials!: Map<string, string>;

  private blocks!: Map<string, BlockNode[]>;

  private sources!: Map<string, string>;

  private cache?: LRUCache<CompiledTemplate>;

  private compiled?: CompiledTemplate;

  /**
   * Whether the code being generated may write output to the stream. True
   * only in stream mode, for the template's own top-level output.
   */
  public flushable = false;

  constructor(
    public options: Required<CompilerOptions>,
    cache?: LRUCache<CompiledTemplate>,
    private revalidate = true,
    private stream = false,
  ) {
    super();
    this.cache = cache;
  }

  async compile(
    template: string,
    root = true,
    partials = new Map<string, string>(),
    blocks = new Map<string, BlockNode[]>(),
    sources = new Map<string, string>(),
  ) {
    this.template = template;
    this.isRoot = root;
    this.partials = partials;
    this.blocks = blocks;
    this.sources = sources;

    // Generate cache key from template and options
    const cacheKey = this.generateCacheKey(template);

    // Check cache first
    if (this.cache && root) {
      const cached = this.cache.get(cacheKey);

      if (cached) {
        if (
          cached.fingerprint === this.fingerprint() &&
          (await this.isFresh(cached))
        ) {
          this.code = cached.code;
          this.mappings = cached.mappings;
          this.compiled = cached;

          return this;
        }

        this.cache.delete(cacheKey);
      }
    }

    this.rootNode = new Parser(this.options).parse(template);
    this.state = {};

    this.start(this.isRoot);

    await this.parseTemplates();

    if (this.isRoot) {
      if (this.partials.size) {
        this.pushRaw(null, 'let d_=0;', 'const p={');

        for (const [path, code] of this.partials) {
          this.pushRaw(
            null,
            `${JSON.stringify(path)}:async()=>{`,
            `if(d_>=${MAX_INCLUDE_DEPTH})throw new Error(${JSON.stringify(`Includes of ${JSON.stringify(path)} are nested too deeply`)});`,
            'd_++;',
            'try{return await(async()=>{',
            code,
            '})();}finally{d_--;}',
            '},',
          );
        }

        this.pushRaw(null, '};');
      }

      if (this.blocks.size) {
        this.pushRaw(null, 'const b={');

        for (const [name, _blocks] of this.blocks) {
          this.pushRaw(null, `${JSON.stringify(name)}:{`, 'u:0,', 's:[');

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

    this.flushable = this.isRoot && this.stream;

    await this.compileNode(this.rootNode);

    this.flushable = false;

    this.end();

    // Store in cache
    if (this.cache && root) {
      this.compiled = {
        code: this.code,
        mappings: this.mappings,
        sources: this.sources,
        fingerprint: this.fingerprint(),
      };
      this.cache.set(cacheKey, this.compiled);
    }

    return this;
  }

  get script() {
    if (!this.compiled) {
      return super.script;
    }

    return (this.compiled.script ??= super.script);
  }

  private generateCacheKey(template: string): string {
    return templateCacheKey(template, this.stream);
  }

  private fingerprint() {
    return optionsFingerprint(this.options);
  }

  private async isFresh({ sources }: CompiledTemplate) {
    if (!this.revalidate) {
      return true;
    }

    try {
      for (const [path, source] of sources) {
        if ((await this.options.loader(path)) !== source) {
          return false;
        }
      }
    } catch {
      return false;
    }

    return true;
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

        this.sources.set(path, template ?? '');

        // Reserved before compiling, so that a template that includes itself,
        // directly or through others, refers to the partial being compiled
        // instead of compiling it again without end
        this.partials.set(path, '');

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
      for (const child of (node as RootNode).body) {
        await this.compileNode(child);

        // Between top-level nodes is always a safe place to write to the
        // stream
        if (this.flushable && child.type !== 'TEXT') {
          this.pushFlush();
        }
      }

      return;
    }

    let compiler = this.options.compilers[node.type];

    if (typeof compiler === 'string') {
      compiler = this.options.compilers[compiler];
    }

    if (!compiler) {
      compiler = this.options.compilers['UNKNOWN'];
    }

    const checkpoint = this.checkpoint();
    const { flushable } = this;

    if (!transparent.has(node.type)) {
      this.flushable = false;
    }

    try {
      await (compiler as CompilerFn)?.(node, this);
    } catch (error: any) {
      this.flushable = flushable;

      if (error?.name === 'CompileError') {
        throw error;
      }

      // The node is not what its compiler expects, typically because its
      // expression failed to parse. Drop whatever was emitted for it so the
      // rest of the template still compiles.
      this.rollback(checkpoint);
      this.options.debug(
        new CompileError(
          `Invalid "${node.type.toLowerCase()}" directive`,
          this.template,
          node.loc,
        ),
      );
    }

    this.flushable = flushable;
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
        this.sources,
      );

      this.partials.set(path, code);
    } catch {
      this.options.debug(
        new CompileError('Failed to compile template', this.template, node.loc),
      );
    }
  }
}
