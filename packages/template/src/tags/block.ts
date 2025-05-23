import { AST, EndTag, StartTag } from '../ast';
import { ROOT } from '../config';
import { Tag } from '../types';

const BLOCK = 'block';
const ENDBLOCK = 'endblock';
const SUPER = 'super';
const ENDSUPER = 'endsuper';
const RE = /^(?:#block\s+(.+))|(super\(\))|(\/block)$/;

/**
 * @example {{ #block title }}...{{ /block }}{{ #block title }}{{ super() }}...{{ /block }}
 */
export const tag: Tag = {
  parse(base, content) {
    const [, rawStatement, _super, end] = content.match(RE) ?? [];

    if (end) {
      const tag = {
        ...base,
        name: ENDBLOCK,
      };

      if (this.verifyFirstTag(BLOCK, tag)) {
        this.end(tag);
      }

      return;
    }

    if (_super) {
      const tag = {
        ...base,
        name: SUPER,
        rawStatement,
      };

      if (this.verifyFirstTag(BLOCK, tag)) {
        this.start(tag);

        // Self closing
        this.end({
          ...base,
          startIndex: base.endIndex,
          name: ENDSUPER,
        });
      }

      return;
    }

    if (rawStatement) {
      const tag = {
        ...base,
        name: BLOCK,
        rawStatement,
      };

      if (this.verifyFirstTag(ROOT, tag)) {
        const startTag = this.start(tag);

        if (startTag) {
          if (!tagsMap.has(this)) {
            tagsMap.set(this, {});
          }

          const tags = tagsMap.get(this)!;

          // Save start tags to map
          if (!tags[rawStatement]) {
            tags[rawStatement] = [];
          }

          tags[rawStatement].push(startTag);
        }
      }

      return;
    }

    return false;
  },

  async compile(template, tag, context, out, compileContent) {
    if (tag.name === BLOCK) {
      let loc;
      const tags = getTags(tag as StartTag, this);
      if (tags.indexOf(tag as StartTag) === 0) {
        const { level, index } = (tag as StartTag).node;
        const affix = `${level}_${index}`;
        let curry = '';
        for (let i = 0; i < tags.length; i++) {
          const _tag = tags[i] as StartTag;
          this.goto(_tag);
          out.pushLine(`const _b_${affix}_${_tag.startIndex}=async(_s)=>{`);
          await compileContent(template, _tag, context, this, out);
          out.pushStr(
            template.slice(
              this.cursor.endIndex,
              (_tag.next as EndTag).startIndex,
            ),
          );
          this.goto(_tag.next as EndTag);
          out.pushLine('};');
          curry = `async()=>await _b_${affix}_${_tag.startIndex}(${curry})`;
        }

        loc = out.pushLine(`await (${curry})();`);
        delTags(tag as StartTag, this);
      } else {
        this.goto(tag.next!);
      }
      return loc;
    }

    if (tag.name === SUPER) {
      out.pushLine(`await _s?.();`);
      return;
    }

    if (tag.name === ENDSUPER) {
      return;
    }

    if (tag.name === ENDBLOCK) {
      return;
    }

    return false;
  },
};

const tagsMap = new WeakMap<AST, Record<string, StartTag[]>>();

function getTags(tag: StartTag, ast: AST) {
  return tagsMap.get(ast)![tag.rawStatement!];
}

function delTags(tag: StartTag, ast: AST) {
  return (tagsMap.get(ast)![tag.rawStatement!] = []);
}
