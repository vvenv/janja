import { OutScript } from './out-script';
import { CONTEXT } from './param-names';

export class Context extends OutScript {
  context = CONTEXT;

  private stack: string[] = [CONTEXT];

  private index = 0;

  in() {
    this.context = `${this.context}_${this.index++}`;
    this.stack.push(this.context);

    return this.context;
  }

  out() {
    if (this.context === CONTEXT) {
      return;
    }

    this.stack.pop();
    this.context = this.stack.at(-1)!;
  }
}
