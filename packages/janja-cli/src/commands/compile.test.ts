import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { renderCompiled } from 'janja';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { compileTemplate } from './compile.js';

describe('compileTemplate', () => {
  const testDir = join(process.cwd(), 'test-temp');
  const inputDir = join(testDir, 'input');
  const outputDir = join(testDir, 'output');

  beforeEach(async () => {
    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should compile a simple template to JavaScript', async () => {
    const templatePath = join(inputDir, 'test.janja');
    const templateContent = 'Hello World!';

    await writeFile(templatePath, templateContent, 'utf-8');

    await compileTemplate(templatePath, outputDir, {});

    const outputPath = join(outputDir, 'test.js');
    const result = await readFile(outputPath, 'utf-8');

    expect(result).toContain('export function script(c, e, f, w) {');
    expect(result).toContain('Hello World');
  });

  it('should compile a template with variables', async () => {
    const templatePath = join(inputDir, 'vars.janja');
    const templateContent = '{{= name }}';

    await writeFile(templatePath, templateContent, 'utf-8');

    await compileTemplate(templatePath, outputDir, {});

    const outputPath = join(outputDir, 'vars.js');
    const result = await readFile(outputPath, 'utf-8');

    expect(result).toContain('s+=e(c.name)');
  });

  it('should include runtime when requested', async () => {
    const templatePath = join(inputDir, 'runtime.janja');
    const templateContent = '{{= name }}';

    await writeFile(templatePath, templateContent, 'utf-8');

    await compileTemplate(templatePath, outputDir, { runtime: true });

    const outputPath = join(outputDir, 'runtime.js');
    const result = await readFile(outputPath, 'utf-8');

    expect(result).toContain("import { renderCompiled } from 'janja';");
    expect(result).toContain('export default function render(');
  });

  it('should create output directory if it does not exist', async () => {
    const templatePath = join(inputDir, 'test.janja');
    const templateContent = 'Hello World!';

    await writeFile(templatePath, templateContent, 'utf-8');

    const nestedOutputDir = join(outputDir, 'nested', 'dir');

    await compileTemplate(templatePath, nestedOutputDir, {});

    const outputPath = join(nestedOutputDir, 'test.js');
    const result = await readFile(outputPath, 'utf-8');

    expect(result).toContain('Hello World');
  });

  it('should produce modules that render, resolving includes from disk', async () => {
    await mkdir(join(inputDir, 'partials'), { recursive: true });
    await writeFile(
      join(inputDir, 'page.janja'),
      '<{{= title }}>{{ include "partials/footer" }}',
    );
    await writeFile(
      join(inputDir, 'partials', 'footer.janja'),
      '[{{= year }}]',
    );

    expect(
      await compileTemplate(inputDir, outputDir, { recursive: true }),
    ).toBe(2);

    const { script } = await import(
      /* @vite-ignore */ pathToFileURL(join(outputDir, 'page.js')).href
    );

    expect(await renderCompiled(script, { title: 'a&b', year: 2026 })).toBe(
      '<a&amp;b>[2026]',
    );

    // directory layout is preserved
    await readFile(join(outputDir, 'partials', 'footer.js'), 'utf-8');
  });

  it('should only descend into directories when recursive', async () => {
    await mkdir(join(inputDir, 'nested'), { recursive: true });
    await writeFile(join(inputDir, 'a.html'), 'a');
    await writeFile(join(inputDir, 'notes.txt'), 'ignored');
    await writeFile(join(inputDir, 'nested', 'b.janja'), 'b');

    expect(await compileTemplate(inputDir, outputDir, {})).toBe(1);
  });

  it('should fail on template errors and on includes outside the root', async () => {
    await writeFile(join(inputDir, 'broken.janja'), '{{ if x }}a');
    await expect(compileTemplate(inputDir, outputDir, {})).rejects.toThrow(
      'Unclosed "if"',
    );

    await writeFile(
      join(inputDir, 'broken.janja'),
      '{{ include "../secret" }}',
    );
    await expect(compileTemplate(inputDir, outputDir, {})).rejects.toThrow(
      'Failed to load template',
    );
  });

  it('should write source maps and declarations on request', async () => {
    await writeFile(join(inputDir, 'page.janja'), 'Hi {{= name }}{{= title }}');

    await compileTemplate(inputDir, outputDir, {
      sourceMap: true,
      dts: true,
      runtime: true,
    });

    const code = await readFile(join(outputDir, 'page.js'), 'utf-8');
    const map = JSON.parse(
      await readFile(join(outputDir, 'page.js.map'), 'utf-8'),
    );
    const dts = await readFile(join(outputDir, 'page.d.ts'), 'utf-8');

    expect(code.trimEnd().endsWith('//# sourceMappingURL=page.js.map')).toBe(
      true,
    );
    expect(map).toMatchObject({
      version: 3,
      file: 'page.js',
      sources: ['../input/page.janja'],
      sourcesContent: ['Hi {{= name }}{{= title }}'],
    });
    expect(dts).toContain('  name?: unknown;\n  title?: unknown;');
    expect(dts).toContain('export default function render(');
  });

  it('should throw error for non-existent file', async () => {
    const nonExistentPath = join(inputDir, 'nonexistent.janja');

    await expect(
      compileTemplate(nonExistentPath, outputDir, {}),
    ).rejects.toThrow();
  });
});
