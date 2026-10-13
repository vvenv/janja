import { OutScript } from './out-script';
import { CONTEXT } from './param-names';

export class Context extends OutScript {
  context = CONTEXT;

  private stack: string[] = [CONTEXT];

  private index = 0;

  checkpoint(): unknown {
    return [super.checkpoint(), this.context, [...this.stack]];
  }

  rollback(checkpoint: unknown) {
    const [code, context, stack] = checkpoint as [unknown, string, string[]];

    super.rollback(code);
    this.context = context;
    this.stack = stack;
  }

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
