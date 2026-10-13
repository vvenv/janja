export interface FileLoaderOptions {
  /**
   * Extensions tried, in order, when a path has none.
   * @default ['.janja', '.html']
   */
  extensions?: string[];
}

/**
 * A `loader` that reads templates from a directory (Node.js only).
 *
 * Paths are resolved against `root`, with or without an extension, and may
 * not lead outside of it, so that a template cannot include arbitrary files.
 */
export function createFileLoader(
  root: string,
  { extensions = ['.janja', '.html'] }: FileLoaderOptions = {},
) {
  return async (name: string) => {
    // Loaded lazily so that the entry point stays importable in browsers
    const { readFile } = await import('node:fs/promises');
    const path = await import('node:path');

    const base = path.resolve(root);
    const candidates = path.extname(name)
      ? [name]
      : [...extensions.map((extension) => `${name}${extension}`), name];

    for (const candidate of candidates) {
      const file = path.resolve(base, candidate);

      if (!file.startsWith(base + path.sep)) {
        break;
      }

      try {
        return await readFile(file, 'utf-8');
      } catch {
        // try the next candidate
      }
    }

    throw new Error(`Template "${name}" not found in ${root}`);
  };
}
