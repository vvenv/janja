import { describe, expect, it } from 'vitest';
import { precompileTemplate } from './precompile';

describe('precompileTemplate', () => {
  it('should compile a simple template', async () => {
    const template = 'Hello World';
    const compiled = await precompileTemplate(template);

    expect(compiled).toContain('return(async()=>{');
    expect(compiled).toContain('let s=""');
    expect(compiled).toContain('Hello World');
  });

  it('should compile a template with variables', async () => {
    const template = '{{= name }}';
    const compiled = await precompileTemplate(template);

    expect(compiled).toContain('s+=e(c.name)');
  });

  it('should compile a template with directives', async () => {
    const template = '{{ if user }}Hello{{ endif }}';
    const compiled = await precompileTemplate(template);

    expect(compiled).toContain('if(c.user)');
  });

  it('should include runtime when requested', async () => {
    const template = '{{= name }}';
    const compiled = await precompileTemplate(template, {
      includeRuntime: true,
    });

    expect(compiled).toContain('export default async function render');
    expect(compiled).toContain('const escape = (v)');
  });

  it('should not include runtime by default', async () => {
    const template = '{{= name }}';
    const compiled = await precompileTemplate(template);

    expect(compiled).not.toContain('export default async function render');
    expect(compiled).not.toContain('const escape = (v)');
  });
});
