import type { Loc, Pos, Script } from './types'
import { CONTEXT, ESCAPE, FILTERS } from './identifiers'
import { SourceMap } from './source-map'

export class OutScript extends SourceMap {
  public code = ''

  get script() {
    return new Function(
      CONTEXT,
      ESCAPE,
      FILTERS,
      this.code,
    ) as Script
  }

  start() {
    this.pushRaw(
      null,
      'return(async()=>{',
      'let s="";',
    )
  }

  end() {
    this.pushRaw(
      null,
      'return s;',
      '})();',
    )
  }

  pushRaw(
    loc: Loc | null,
    ...lines: string[]
  ) {
    const start = this.code.length

    for (const line of lines) {
      this.code += line
    }

    if (!loc) {
      return
    }

    this.addMapping(
      loc,
      {
        start: {
          line: 1,
          column: start,
        },
        end: {
          line: 1,
          column: this.code.length,
        },
      },
    )
  }

  pushStr(
    loc: Loc | null,
    s: string,
  ): Pos | void {
    if (s) {
      this.pushRaw(
        loc,
        `s+="${s
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/[\n\r]/g, '\\n')}";`,
      )
    }
  }

  pushVar(
    loc: Loc | null,
    v: string,
  ) {
    this.pushRaw(
      loc,
      `s+=${ESCAPE}(${v});`,
    )
  }
}
