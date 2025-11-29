import { expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('unexpected', async () => {
  try {
    await compile('{{ endif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endif" node]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpected "endif" node

      1｜ {{ endif }}
       ｜ ^         ^
      "
    `);
  }
});
