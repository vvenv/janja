import {
  CONTEXT,
  ESCAPE,
  FILTERS,
  RESULT,
  UNKNOWN_FILTER,
  WRITE,
} from './param-names';
import { SourceMap } from './source-map';
import type { Loc, Pos, Script } from './types';

// Characters of output to collect before writing a chunk to the stream
export const FLUSH_SIZE = 1024;

export class OutScript extends SourceMap {
  private codeParts: string[] = [];

  // Length of the code so far, tracked to avoid joining the parts just to
  // find out where the next one starts
  private codeLength = 0;

  get code() {
    return this.codeParts.join('');
  }

  set code(value: string) {
    this.codeParts = [value];
    this.codeLength = value.length;
  }

  get script() {
    // eslint-disable-next-line no-new-func
    return new Function(CONTEXT, ESCAPE, FILTERS, WRITE, this.code) as Script;
  }

  checkpoint(): unknown {
    return [this.codeParts.length, this.mappings.length, this.codeLength];
  }

  rollback(checkpoint: unknown) {
    const [parts, mappings, length] = checkpoint as number[];

    this.codeParts.length = parts;
    this.mappings.length = mappings;
    this.codeLength = length;
  }

  start(root = true) {
    this.pushRaw(null, 'return(async()=>{', `let s="",${RESULT};`);

    // Included templates are nested in the root one and share its helper
    if (root) {
      this.pushRaw(
        null,
        `const ${UNKNOWN_FILTER}=(n)=>{throw new Error('Unknown filter "'+n+'"')};`,
      );
    }
  }

  end() {
    this.pushRaw(null, 'return s;', '})();');
  }

  pushRaw(loc: Loc | null, ...lines: string[]) {
    const start = this.codeLength;

    for (const line of lines) {
      this.codeParts.push(line);
      this.codeLength += line.length;
    }

    if (!loc) {
      return;
    }

    this.addMapping(loc, {
      start: {
        line: 1,
        column: start,
      },
      end: {
        line: 1,
        column: this.codeLength,
      },
    });
  }

  pushStr(loc: Loc | null, s: string): Pos | void {
    if (s) {
      this.pushRaw(loc, `s+=${JSON.stringify(s)};`);
    }
  }

  /**
   * In stream mode, hand the output collected so far to the writer once
   * there is enough of it. Only valid where `s` is the template's own output,
   * i.e. not inside captures, macros, blocks or partials.
   */
  pushFlush() {
    this.pushRaw(null, `if(s.length>${FLUSH_SIZE}){await ${WRITE}(s);s="";}`);
  }

  pushVar(loc: Loc | null, v: string) {
    this.pushRaw(loc, `s+=${ESCAPE}(${v});`);
  }
}
