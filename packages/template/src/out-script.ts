import type { Config, Loc, Script } from './types'
import { CONTEXT, ESCAPE, FILTERS, HELPERS } from './config'
import { unescapeTag } from './utils/unescape-tag'

export class OutScript {
  private content = ''

  private strOffset = 's+="'.length

  private varOffset = `s+=${ESCAPE}(`.length

  constructor(public options: Required<Config>) {}

  get value() {
    return this.content
  }

  get script() {
    // eslint-disable-next-line no-new-func
    return new Function(CONTEXT, FILTERS, ESCAPE, HELPERS, this.value) as Script
  }

  start() {
    if (this.options.strictMode) {
      this.pushLine('"use strict";')
    }

    this.pushLine('return(async()=>{', 'let s="";')
  }

  end() {
    this.pushLine('return s;', '})();')
  }

  pushLine(...lines: string[]): Loc {
    const start = this.content.length

    for (const line of lines) {
      this.content += line
    }

    return {
      start,
      end: this.content.length,
    }
  }

  pushStr(
    s: string,
    o?: { trimStart?: boolean, trimEnd?: boolean },
  ): Loc | void {
    if (s) {
      if (o?.trimStart || this.options.trimWhitespace) {
        s = s.trimStart()
      }

      if (o?.trimEnd || this.options.trimWhitespace) {
        s = s.trimEnd()
      }
    }

    if (s) {
      const start = this.content.length + this.strOffset

      s = unescapeTag(s)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/[\n\r]/g, '\\n')
      this.pushLine(`s+="${s}";`)

      return {
        start,
        end: this.content.length - 2,
      }
    }
  }

  pushVar(v: string): Loc {
    const start = this.content.length + this.varOffset

    this.pushLine(`s+=${ESCAPE}(${v});`)

    return {
      start,
      end: start + v.length,
    }
  }
}
