import {
  analyzeTemplate,
  formatTemplate,
  precompile,
  Renderer,
  type RendererOptions,
  validateTemplate,
} from 'janja';

export interface TemplateFile {
  name: string;
  content: string;
}

export interface RunOptions {
  autoEscape: boolean;
  lenient: boolean;
  stripComments: boolean;
  trimWhitespace: boolean;
}

export interface RunInput {
  /** The first file is rendered, the others can be included by name */
  files: TemplateFile[];
  /** JSON */
  data: string;
  options: RunOptions;
}

export interface Problem {
  severity: 'error' | 'warning';
  message: string;
}

export interface RunResult {
  output: string;
  compiled: string;
  analysis: string;
  problems: Problem[];
  /** Milliseconds spent compiling and rendering */
  time: number;
}

export const defaultOptions: RunOptions = {
  autoEscape: true,
  lenient: false,
  stripComments: false,
  trimWhitespace: false,
};

const describe = (error: unknown) => {
  const { details, message } = error as { details?: string; message?: string };

  return details || message || String(error);
};

const createLoader = (files: TemplateFile[]) => async (path: string) => {
  const file = files.find(
    ({ name }) => name === path || name.replace(/\.[^./]+$/, '') === path,
  );

  if (!file) {
    throw new Error(`Template "${path}" does not exist`);
  }

  return file.content;
};

export async function run({ files, data, options }: RunInput) {
  const result: RunResult = {
    output: '',
    compiled: '',
    analysis: '',
    problems: [],
    time: 0,
  };
  const report = (error: unknown, severity: Problem['severity'] = 'error') => {
    const message = describe(error);

    if (!result.problems.some((problem) => problem.message === message)) {
      result.problems.push({ severity, message });
    }
  };
  const [{ content: template }] = files;
  const { lenient, ...rest } = options;
  const rendererOptions: RendererOptions = {
    ...rest,
    loader: createLoader(files),
    // every run is a new renderer: nothing would ever be read from the cache
    cache: { enabled: false },
    ...(lenient ? { debug: (error: unknown) => report(error) } : {}),
  };

  let globals: Record<string, unknown> = {};

  try {
    globals = data.trim() ? JSON.parse(data) : {};

    if (!globals || typeof globals !== 'object' || Array.isArray(globals)) {
      throw new Error('The data must be a JSON object');
    }
  } catch (error) {
    report(`Data: ${(error as Error).message}`);

    return result;
  }

  const start = performance.now();

  try {
    result.output = await new Renderer(rendererOptions).render(
      template,
      globals,
    );
  } catch (error) {
    report(error);
  }

  result.time = performance.now() - start;

  try {
    const { warnings } = await validateTemplate(template, rendererOptions);

    for (const { message, line, column } of warnings) {
      // an unknown filter may already have failed the render
      if (
        !result.problems.some((problem) => problem.message.includes(message))
      ) {
        report(`${message} (${line}:${column})`, 'warning');
      }
    }
  } catch {
    // already reported by the renderer
  }

  // the compiled module and the analysis are best effort: a template that
  // does not compile has neither
  const silent = { ...rendererOptions, debug: () => {} };

  try {
    result.compiled = (await precompile(template, silent)).code;
  } catch {
    result.compiled = '';
  }

  try {
    result.analysis = JSON.stringify(
      await analyzeTemplate(template, silent),
      null,
      2,
    );
  } catch {
    result.analysis = '';
  }

  return result;
}

export function format(template: string) {
  return formatTemplate(template);
}
