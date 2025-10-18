import type { BinaryExp, BoolExp, Exp, IdExp, IfExp, NotExp, NumExp, PipeExp, SeqExp, StrExp } from './types'
import { operators } from './operators'

export class Compiler {
  private context!: string
  private filters!: string

  compile(expression: Exp | null, context: string, filters: string): string {
    this.context = context
    this.filters = filters
    return expression ? this.compileExpression(expression) : '""'
  }

  private compileExpression(expression: Exp): string {
    switch (expression.type) {
      case 'NOT':
        return this.compileNot(expression)
      case 'ID':
        return this.compileId(expression)
      case 'STR':
        return this.compileStr(expression)
      case 'NUM':
        return this.compileNum(expression)
      case 'BOOL':
        return this.compileBool(expression)
      case 'PIPE':
        return this.compilePipe(expression)
      case 'OF':
        return this.compileOf(expression)
      case 'SET':
        return this.compileSet(expression)
      case 'AND':
      case 'OR':
      case 'EQ':
      case 'NE':
      case 'GT':
      case 'LT':
      case 'GE':
      case 'LE':
      case 'IN':
      case 'NI':
      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
      case 'MOD':
        return this.compileBinary(expression)
      case 'IF':
        return this.compileTernary(expression)
      case 'SEQ':
        return this.compileSeq(expression)
    }
  }

  private compileNot({ argument }: NotExp) {
    return `!${this.compileExpression(argument)}`
  }

  private compileId({ value, args }: IdExp) {
    return args ? `${this.context}.${value}(${args.map(arg => this.compileExpression(arg)).join(',')})` : `${this.context}.${value}`
  }

  private compileStr({ value }: StrExp) {
    return JSON.stringify(value)
  }

  private compileSeq({ elements }: SeqExp) {
    return elements.map(element => this.compileExpression(element)).toString()
  }

  private compileNum({ value }: NumExp) {
    return value.toString()
  }

  private compileBool({ value }: BoolExp) {
    return value.toString()
  }

  private compilePipe({ left, right }: PipeExp) {
    const { value: name, args = [] } = right as IdExp
    return `(await ${this.filters}.${name}.call(${[this.context, this.compileExpression(left), ...args.map(arg => this.compileExpression(arg))].join(',')}))`
  }

  private compileOf({ left, right }: BinaryExp) {
    if (left.type === 'SEQ') {
      return `const {${(left.elements as IdExp[]).map(({ value }) => value).join(',')}} of ${this.compileExpression(right)}`
    }
    return `const ${(left as IdExp).value} of ${this.compileExpression(right)}`
  }

  private compileSet({ left, right }: BinaryExp) {
    if (right.type === 'SEQ') {
      return `${this.compileExpression(left)}=async(${(right.elements).map(el => el.type === 'SET' ? `${(el.left as IdExp).value}=${this.compileExpression((el.right))}` : (el as IdExp).value).join(',')})=>async(_c)=>{`
    }
    return `(${this.compileExpression(left)}=${this.compileExpression(right)})`
  }

  private compileBinary({ type, left, right }: BinaryExp) {
    const ret = `(${this.compileExpression(left)}${operators[type]}${this.compileExpression(right)})`
    return type === 'NI' ? `(!${ret})` : ret
  }

  private compileTernary({ test, consequent: then, alternative }: IfExp) {
    return `(${this.compileExpression(test)}?${this.compileExpression(then)}:${alternative ? this.compileExpression(alternative) : '""'})`
  }
}
