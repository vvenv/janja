import { CONTEXT } from './config';
import { AST, ASTNode, StartTag } from './ast';
import { Tag, EngineOptions } from './types';
import { OutScript } from './out-script';
import { SourceMap } from './source-map';
import { sort, tags } from './tags';

export class Parser {
  private tags: Tag[] = tags;

  constructor(public options: Required<EngineOptions>) {}

  registerTags(tags: Tag[]) {
    this.tags = [...this.tags, ...tags].sort(sort);
  }

  async parse(template: string) {
    const ast = new AST(this.options);
    const out = new OutScript(this.options);
    const sourcemap = new SourceMap(this.options);

    ast.parse(template, this.tags);

    if (ast.valid) {
      out.start();

      const { children } = ast;
      if (children.length) {
        for (const child of children) {
          await this.compile(template, child, CONTEXT, ast, out, sourcemap);
        }

        out.pushStr(template.slice(ast.cursor.endIndex), {
          trimStart: ast.cursor.stripAfter,
          trimEnd: false,
        });
      } else {
        out.pushStr(template);
      }

      out.end();
    }

    return { value: out.value, script: out.script, sourcemap };
  }

  async compile(
    template: string,
    { tags }: ASTNode,
    context = CONTEXT,
    ast: AST,
    out: OutScript,
    sourcemap: SourceMap,
  ) {
    const compileContent = (
      template: string,
      tag: StartTag,
      context: string,
      ast: AST,
      out: OutScript,
    ) => this.compileContent(template, tag, context, ast, out, sourcemap);
    for (const _tag of tags) {
      out.pushStr(template.slice(ast.cursor.endIndex, _tag.startIndex), {
        trimStart: ast.cursor.stripAfter,
        trimEnd: _tag.stripBefore,
      });
      ast.goto(_tag);

      for (const tag of this.tags) {
        const r = await tag.compile.call(
          ast,
          template,
          _tag,
          context,
          out,
          compileContent,
        );
        if (r !== false) {
          if (r) {
            sourcemap.addMapping(_tag, r);
          }
          break;
        }
      }
    }
  }

  async compileContent(
    template: string,
    tag: StartTag,
    context: string,
    ast: AST,
    out: OutScript,
    sourcemap: SourceMap,
  ) {
    if (tag.children.length) {
      for (const child of tag.children) {
        await this.compile(template, child, context, ast, out, sourcemap);
      }
    } else {
      const _tag = ast.getNextTag(tag);
      out.pushStr(template.slice(tag.endIndex, _tag.startIndex), {
        trimStart: tag.stripAfter,
        trimEnd: _tag.stripBefore,
      });
      ast.goto(_tag);
    }
  }
}
