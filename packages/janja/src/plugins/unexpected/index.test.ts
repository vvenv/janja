import { expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('unexpected', async () => {
  try {
    await compile('{{ endif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unexpected "endif"]`);
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endif"

      1│ {{ endif }}
       │ ^         ^


      Suggestions:
        1. An unexpected token was found in the template.
           Fix: Check your template syntax and ensure all markers are properly formatted."
    `);
  }
});
