import { OutScript } from './out-script';
import { CONTEXT } from './param-names';

export class Context extends OutScript {
  context = CONTEXT;

  private contexts: string[] = [CONTEXT];

  private index = 0;

  in() {
    this.context = `${this.context}_${this.index++}`;
    this.contexts.push(this.context);

    return this.context;
  }

  out() {
    if (this.context === CONTEXT) {
      return;
    }

    this.contexts.pop();
    this.context = this.contexts.at(-1)!;
  }
}
