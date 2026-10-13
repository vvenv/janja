import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { describe, expect, it } from 'vitest';
import { precompile, precompileTemplate } from './precompile';
import type { Script } from './types';
import { renderCompiled } from './index';

// Evaluate the generated module without touching the file system
async function load(code: string): Promise<Script> {
  const { script } = await import(
    /* @vite-ignore */
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  );

  return script;
}

describe('precompileTemplate', () => {
  it('should compile a simple template', async () => {
    const compiled = await precompileTemplate('Hello World');

    expect(compiled).toContain('export function script(c, e, f, w) {');
    expect(compiled).toContain('export default script;');
    expect(compiled).toContain('Hello World');
  });

  it('should compile a template with variables', async () => {
    const compiled = await precompileTemplate('{{= name }}');

    expect(compiled).toContain('s+=e(c.name)');
  });

  it('should compile a template with directives', async () => {
    const compiled = await precompileTemplate('{{ if user }}Hello{{ endif }}');

    expect(compiled).toContain('if(c.user)');
  });

  it('should include runtime when requested', async () => {
    const compiled = await precompileTemplate('{{= name }}', {
      includeRuntime: true,
    });

    expect(compiled).toContain("import { renderCompiled } from 'janja';");
    expect(compiled).toContain('export default function render(');
  });

  it('should not include runtime by default', async () => {
    const compiled = await precompileTemplate('{{= name }}');

    expect(compiled).not.toContain('import ');
    expect(compiled).not.toContain('function render(');
  });

  it('should produce a module that renders like the original template', async () => {
    const script = await load(
      await precompileTemplate(
        '{{ for n of names }}<{{= n | upper }}>{{ endfor }}{{ include "footer" }}',
        { loader: async (path) => `[${path}:{{= year }}]` },
      ),
    );

    expect(
      await renderCompiled(script, { names: ['a', '<b>'], year: 2026 }),
    ).toBe('<A><&lt;B&gt;>[footer:2026]');
  });

  it('should report compile errors', async () => {
    await expect(precompileTemplate('{{ if x }}a')).rejects.toThrow(
      'Unclosed "if"',
    );
  });

  it('should produce a source map pointing back into the template', async () => {
    const template =
      'Hello\n  {{= user.name }}!\n{{ for i of items }}{{= i | upper }}{{ endfor }}';

    for (const includeRuntime of [false, true]) {
      const { code, map } = await precompile(template, {
        includeRuntime,
        sourceMap: true,
        filename: 'page.janja',
      });

      expect(map).toMatchObject({
        version: 3,
        sources: ['page.janja'],
        sourcesContent: [template],
      });

      const lines = code.split('\n');
      const tracer = new TraceMap(map as any);
      const locate = (generated: string) => {
        const line = lines.findIndex((text) => text.includes(generated));

        return originalPositionFor(tracer, {
          line: line + 1,
          column: lines[line].indexOf(generated),
        });
      };

      // `user.name` is on line 2, after "  {{= "
      expect(locate('s+=e(c.user.name)')).toMatchObject({
        source: 'page.janja',
        line: 2,
        column: 6,
      });
      // the loop maps to the `of` of `i of items` on line 3
      expect(locate('const t_=c.items')).toMatchObject({ line: 3, column: 9 });
      expect(locate('s+=e((r_=(f.upper')).toMatchObject({ line: 3 });
    }
  });

  it('should not produce a source map unless asked', async () => {
    expect((await precompile('{{= a }}')).map).toBeUndefined();
  });
});
