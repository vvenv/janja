import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
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

    expect(result).toContain('return(async()=>{');
    expect(result).toContain('Hello World');
  });

  it('should compile a template with variables', async () => {
    const templatePath = join(inputDir, 'vars.janja');
    const templateContent = '{{= name }}';

    await writeFile(templatePath, templateContent, 'utf-8');

    await compileTemplate(templatePath, outputDir, {});

    const outputPath = join(outputDir, 'vars.js');
    const result = await readFile(outputPath, 'utf-8');

    expect(result).toContain('s+=escape(name)');
  });

  it('should include runtime when requested', async () => {
    const templatePath = join(inputDir, 'runtime.janja');
    const templateContent = '{{= name }}';

    await writeFile(templatePath, templateContent, 'utf-8');

    await compileTemplate(templatePath, outputDir, { runtime: true });

    const outputPath = join(outputDir, 'runtime.js');
    const result = await readFile(outputPath, 'utf-8');

    expect(result).toContain('export default async function render');
    expect(result).toContain('const escape = (v)');
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

  it('should throw error for non-existent file', async () => {
    const nonExistentPath = join(inputDir, 'nonexistent.janja');

    await expect(
      compileTemplate(nonExistentPath, outputDir, {}),
    ).rejects.toThrow();
  });
});
