import { expect, it } from 'vitest';
import { compile } from '../../../test/__helper';

it('unknown', async () => {
  try {
    await compile('{{ xxx }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unknown "xxx" node]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Unknown "xxx" node

      1｜ {{ xxx }}
       ｜ ^       ^
      "
    `);
  }
});
