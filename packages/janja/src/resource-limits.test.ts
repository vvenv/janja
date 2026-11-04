import { describe, expect, it } from 'vitest';
import { Renderer } from './renderer';

describe('security resource limits', () => {
  it('stops loops that exceed maxLoopIterations', async () => {
    const renderer = new Renderer({
      security: { maxLoopIterations: 3 },
      debug: (error) => {
        throw error;
      },
    });

    await expect(
      renderer.render('{{ for x of items }}{{= x }}{{ endfor }}', {
        items: [1, 2, 3, 4],
      }),
    ).rejects.toThrow('Loop iteration limit of 3 exceeded');
  });

  it('counts nested loop iterations against the same budget', async () => {
    const renderer = new Renderer({
      security: { maxLoopIterations: 5 },
      debug: (error) => {
        throw error;
      },
    });

    await expect(
      renderer.render(
        '{{ for a of outer }}{{ for b of inner }}{{= b }}{{ endfor }}{{ endfor }}',
        { outer: [1, 2], inner: [1, 2, 3] },
      ),
    ).rejects.toThrow('Loop iteration limit of 5 exceeded');
  });

  it('allows loops within the budget', async () => {
    const renderer = new Renderer({
      security: { maxLoopIterations: 10 },
    });

    await expect(
      renderer.render('{{ for x of items }}{{= x }}{{ endfor }}', {
        items: [1, 2, 3],
      }),
    ).resolves.toBe('123');
  });

  it('honours a lower maxIncludeDepth', async () => {
    const renderer = new Renderer({
      security: { maxIncludeDepth: 2 },
      loader: async () => 'x{{ include "a" }}',
      debug: (error) => {
        throw error;
      },
    });

    await expect(renderer.render('{{ include "a" }}', {})).rejects.toThrow(
      'Includes of "a" are nested too deeply',
    );
  });

  it('stops recursive macros that exceed maxCallDepth', async () => {
    const renderer = new Renderer({
      security: { maxCallDepth: 3 },
      debug: (error) => {
        throw error;
      },
    });

    await expect(
      renderer.render(
        '{{ macro bomb }}{{ call bomb() }}{{ endcall }}{{ endmacro }}{{ call bomb() }}{{ endcall }}',
        {},
      ),
    ).rejects.toThrow('Macro call depth limit of 3 exceeded');
  });

  it('rejects when timeoutMs elapses', async () => {
    const renderer = new Renderer({
      security: { timeoutMs: 30 },
      filters: {
        hang: () => new Promise<string>(() => {}),
      },
      debug: (error) => {
        throw error;
      },
    });

    await expect(renderer.render('{{= 1 | hang }}', {})).rejects.toThrow(
      'Render timed out after 30ms',
    );
  });
});
