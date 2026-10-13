import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { BinaryExp, Exp } from '../../exp/exp-types';
import type { SyntaxNode } from '../../syntax-nodes';
import { type BreakNode, type ContinueNode, type ForNode } from './syntax';

const loop = 'loop:{first:i_===0,index:i_++,last:i_===n_}';

function hasAssignment(exp: unknown, seen = new Set<object>()): boolean {
  if (!exp || typeof exp !== 'object' || seen.has(exp)) {
    return false;
  }

  seen.add(exp);

  if ((exp as Exp).type === 'ASSIGN') {
    return true;
  }

  return Object.entries(exp).some(([key, value]) =>
    // `f(name=value)` passes a named argument; only its value matters
    key === 'args' && Array.isArray(value)
      ? value.some((arg: Exp) =>
          hasAssignment(
            arg.type === 'ASSIGN' ? (arg as BinaryExp).right : arg,
            seen,
          ),
        )
      : hasAssignment(value, seen),
  );
}

/**
 * Whether nothing in `nodes` can write to, or keep a reference to, the
 * context they are compiled in. Only node types known to be harmless pass;
 * anything else, including directives added by plugins, does not.
 */
function isReadOnly(nodes: SyntaxNode[]): boolean {
  return nodes.every((node: any) => {
    switch (node.type) {
      case 'TEXT':
      case 'COMMENT':
      case 'BREAK':
      case 'CONTINUE':
        return true;
      case 'OUTPUT':
        return !hasAssignment(node.val);
      case 'IF':
        return (
          !hasAssignment(node.test) &&
          isReadOnly(node.body) &&
          node.alternatives.every(
            (branch: any) =>
              !hasAssignment(branch.test) && isReadOnly(branch.body),
          )
        );
      case 'FOR':
        // A nested loop runs its body in a context of its own
        return (
          !hasAssignment(node.loop.right) &&
          isReadOnly(node.alternative?.body ?? [])
        );
      default:
        return false;
    }
  });
}

async function compileFor(
  { loop: { left, right, loc }, body, alternative }: ForNode,
  compiler: Compiler,
) {
  const { context } = compiler;

  const expCompiler = new ExpCompiler();

  compiler.pushRaw(
    loc,
    '{',
    `const t_=${expCompiler.compile(right, context)},`,
    // null/undefined iterate as empty; other iterables are materialised so
    // that `loop.last` works for them too
    'a_=Array.isArray(t_)?t_:Array.from(t_??[]),n_=a_.length;',
  );

  if (alternative) {
    compiler.pushRaw(loc, 'if(!n_){');
    await compiler.compileNodes(alternative.body);
    compiler.pushRaw(loc, '}else{');
  }

  // The loop variables live on the context only, never in JavaScript
  // variables named by the template
  const variables =
    left.type === 'SEQ'
      ? left.elements.map((el) =>
          el.type === 'ASSIGN'
            ? [
                el.left.value,
                `v_.${el.left.value}===undefined?${expCompiler.compile(el.right, context)}:v_.${el.left.value}`,
              ]
            : [el.value, `v_.${el.value}`],
        )
      : [[left.value, 'v_']];

  const scope = compiler.in();

  compiler.pushRaw(loc, 'let i_=0;');

  if (isReadOnly(body)) {
    // Nothing in the body can modify the scope, so a single one is shared by
    // all iterations instead of copying the outer context for each of them
    compiler.pushRaw(
      loc,
      `const ${scope}={...${context}};`,
      'for(const v_ of a_){',
      `${scope}.loop={${loop.slice(6)};`,
      ...variables.map(([name, value]) => `${scope}.${name}=${value};`),
    );
  } else {
    compiler.pushRaw(
      loc,
      'for(const v_ of a_){',
      `const ${scope}={`,
      `...${context},`,
      `${loop},`,
      ...variables.map(([name, value]) => `${name}:${value},`),
      '};',
    );
  }

  await compiler.compileNodes(body);
  compiler.out();

  if (compiler.flushable) {
    compiler.pushFlush();
  }

  compiler.pushRaw(null, alternative ? '}}}' : '}}');
}

function compileBreak({ loc }: BreakNode, compiler: Compiler) {
  compiler.pushRaw(loc, 'break;');
}

function compileContinue({ loc }: ContinueNode, compiler: Compiler) {
  compiler.pushRaw(loc, 'continue;');
}

export const compilers = {
  FOR: compileFor,
  BREAK: compileBreak,
  CONTINUE: compileContinue,
};
