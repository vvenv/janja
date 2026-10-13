import type { BinaryExp, Exp, IdExp, SeqExp } from './exp/exp-types';
import * as filters from './filters';
import { compilerOptions, mergeOptions } from './options';
import { Parser } from './parser';
import { plugins } from './plugins';
import type { SyntaxNode } from './syntax-nodes';
import type { CompilerOptions } from './types';

export interface TemplateAnalysis {
  /** Names the template reads from the data it is rendered with */
  variables: string[];
  /** Filters the template applies */
  filters: string[];
  /** Templates it includes, directly or through other includes */
  includes: string[];
  /** Blocks it defines */
  blocks: string[];
  /** Macros it defines */
  macros: string[];
}

type Scope = Set<string>;

class Analyzer {
  variables = new Set<string>();

  filters = new Set<string>();

  includes = new Set<string>();

  blocks = new Set<string>();

  macros = new Set<string>();

  constructor(private options: Required<CompilerOptions>) {}

  async analyze(template: string, scope: Scope = new Set()) {
    const root = new Parser(this.options).parse(template);

    await this.nodes(root.body, scope);
  }

  // Nodes run one after another in the same scope: a `set` makes its name
  // known to everything after it
  private async nodes(nodes: SyntaxNode[] = [], scope: Scope) {
    for (const node of nodes) {
      await this.node(node as any, scope);
    }
  }

  private async node(node: any, scope: Scope) {
    switch (node.type) {
      case 'OUTPUT':
        this.exp(node.val, scope);

        break;
      case 'IF':
        this.exp(node.test, scope);
        await this.nodes(node.body, scope);

        for (const branch of node.alternatives) {
          this.exp(branch.test, scope);
          await this.nodes(branch.body, scope);
        }

        break;
      case 'FOR': {
        this.exp(node.loop.right, scope);
        await this.nodes(node.alternative?.body, scope);

        const inner = new Set(scope).add('loop');

        this.bind(node.loop.left, inner, scope);
        await this.nodes(node.body, inner);

        break;
      }
      case 'SET':
        this.exp(node.val.right, scope);
        this.bind(node.val.left, scope, scope);

        break;
      case 'CAPTURE':
        await this.nodes(node.body, scope);
        scope.add(node.val.value);

        break;
      case 'MACRO': {
        const inner = new Set(scope);

        for (const arg of node.val.args ?? []) {
          this.bind(arg, inner, scope);
        }

        scope.add(node.val.value);
        this.macros.add(node.val.value);
        await this.nodes(node.body, inner);

        break;
      }
      case 'CALL':
        this.exp(node.val, scope);
        await this.nodes(node.body, scope);

        break;
      case 'WITH':
        this.exp(node.expression, scope);
        // Inside, names refer to properties of that value, not to the data
        await this.nodes(node.body, opaque);

        break;
      case 'BLOCK':
        this.blocks.add(node.val.value);
        await this.nodes(node.body, scope);

        break;
      case 'INCLUDE':
        await this.include(node.val.value, scope);

        break;
      default:
        await this.nodes(node.body, scope);
    }
  }

  private async include(path: string, scope: Scope) {
    if (this.includes.has(path)) {
      return;
    }

    this.includes.add(path);

    let template: string | undefined;

    try {
      template = await this.options.loader(path);
    } catch {
      // Reported when the template is compiled; nothing to analyse here
    }

    if (template) {
      await this.analyze(template, new Set(scope));
    }
  }

  // `x`, `(a, b)` or `x = default`: the names become known in `target`,
  // defaults are read in `scope`
  private bind(exp: Exp, target: Scope, scope: Scope) {
    if (exp.type === 'ID') {
      target.add(exp.value);
    } else if (exp.type === 'SEQ') {
      exp.elements.forEach((element) => this.bind(element, target, scope));
    } else if (exp.type === 'ASSIGN') {
      this.exp(exp.right, scope);
      this.bind(exp.left, target, scope);
    }
  }

  private exp(exp: Exp | null | undefined, scope: Scope) {
    if (!exp) {
      return;
    }

    switch (exp.type) {
      case 'ID':
        if (scope !== opaque && !scope.has(exp.value)) {
          this.variables.add(exp.value);
        }

        exp.args?.forEach((arg) => this.exp(arg, scope));

        break;
      case 'LIT':
        break;
      case 'NOT':
        this.exp(exp.argument, scope);

        break;
      case 'IF':
        this.exp(exp.test, scope);
        this.exp(exp.consequent, scope);
        this.exp(exp.alternative, scope);

        break;
      case 'SEQ':
        (exp as SeqExp).elements.forEach((element) => this.exp(element, scope));

        break;
      case 'PIPE': {
        const { left, right } = exp as BinaryExp<'PIPE', Exp, IdExp>;

        this.exp(left, scope);
        this.filters.add(right.value);

        for (const arg of right.args ?? []) {
          // `name=value` passes a named argument
          this.exp(
            arg.type === 'ASSIGN' ? (arg as BinaryExp).right : arg,
            scope,
          );
        }

        break;
      }
      default:
        this.exp((exp as BinaryExp).left, scope);
        this.exp((exp as BinaryExp).right, scope);
    }
  }
}

// Marks a scope in which every name is considered known
const opaque: Scope = new Set();

/**
 * Statically determine what a template needs: the data it reads, the filters
 * it applies and the templates it includes. Included templates are followed
 * through the `loader` option.
 */
export async function analyzeTemplate(
  template: string,
  options: CompilerOptions = {},
): Promise<TemplateAnalysis> {
  const analyzer = new Analyzer(
    mergeOptions(compilerOptions, { filters, plugins }, options),
  );

  await analyzer.analyze(template);

  const sorted = (set: Set<string>) => [...set].sort();

  return {
    variables: sorted(analyzer.variables),
    filters: sorted(analyzer.filters),
    includes: sorted(analyzer.includes),
    blocks: sorted(analyzer.blocks),
    macros: sorted(analyzer.macros),
  };
}

/**
 * TypeScript declarations for a module produced by `precompile`: the data
 * the template reads becomes the `TemplateData` interface.
 */
export function generateDeclarations(
  { variables }: Pick<TemplateAnalysis, 'variables'>,
  { includeRuntime = false } = {},
) {
  const members = variables.map((name) => `  ${name}?: unknown;`).join('\n');

  return `// Generated by the Janja precompiler. Do not edit.
import type { ${includeRuntime ? 'RendererOptions, ' : ''}Script } from 'janja';

/** The data this template reads. */
export interface TemplateData {${members ? `\n${members}\n` : ''}}

export declare const script: Script;

${
  includeRuntime
    ? 'export default function render(\n  data?: TemplateData,\n  options?: RendererOptions,\n): Promise<string>;'
    : 'export default script;'
}
`;
}
