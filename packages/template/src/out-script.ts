import type { EngineOptions, Location, ParsedScript } from './types'
import { CONTEXT, ESCAPE, FILTERS, HELPERS } from './config'

export class OutScript {
  private content = ''
  private strOffset = `s+="`.length
  private varOffset = `s+=${ESCAPE}(`.length

  constructor(public options: Required<EngineOptions>) {}

  get value() {
    return this.content
  }

  get script() {
    // eslint-disable-next-line no-new-func
    return new Function(CONTEXT, FILTERS, ESCAPE, HELPERS, this.value) as ParsedScript
  }

  start() {
    if (this.options.strictMode) {
      this.pushLine(`"use strict";`)
    }

    this.pushLine('return(async()=>{', 'let s="";')
  }

  end() {
    this.pushLine('return s;', '})();')
  }

  pushLine(...lines: string[]): Location {
    const startIndex = this.content.length
    for (const line of lines) {
      this.content += line
    }
    return {
      startIndex,
      endIndex: this.content.length,
    }
  }

  pushStr(
    s: string,
    o?: { trimStart: boolean, trimEnd: boolean },
  ): Location | void {
    if (s) {
      if (o?.trimStart || this.options.trimWhitespace) {
        s = s.trimStart()
      }
      if (o?.trimEnd || this.options.trimWhitespace) {
        s = s.trimEnd()
      }
    }
    if (s) {
      const startIndex = this.content.length + this.strOffset
      s = this.unescapeTag(s)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/[\n\r]/g, '\\n')
      this.pushLine(`s+="${s}";`)
      return {
        startIndex,
        endIndex: this.content.length - 2,
      }
    }
  }

  pushVar(v: string): Location {
    const startIndex = this.content.length + this.varOffset
    this.pushLine(`s+=${ESCAPE}(${v});`)
    return {
      startIndex,
      endIndex: startIndex + v.length,
    }
  }

  unescapeTag(v: string) {
    return v.replace(/\\(\{|\})/g, '$1')
  }
}
