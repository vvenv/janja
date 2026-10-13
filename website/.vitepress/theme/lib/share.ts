import { defaultOptions, type RunInput } from './engine';

const toBase64Url = (bytes: Uint8Array) => {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const fromBase64Url = (value: string) => {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

/**
 * The state of the playground as a URL fragment. Fragments are not sent to
 * the server, so shared templates stay between the people sharing them.
 */
export function encodeState({ files, data, options }: RunInput) {
  const changed = Object.fromEntries(
    Object.entries(options).filter(
      ([key, value]) =>
        value !== defaultOptions[key as keyof typeof defaultOptions],
    ),
  );

  return toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        f: files.map(({ name, content }) => [name, content]),
        d: data,
        ...(Object.keys(changed).length ? { o: changed } : {}),
      }),
    ),
  );
}

export function decodeState(hash: string): RunInput | null {
  try {
    const { f, d, o } = JSON.parse(
      new TextDecoder().decode(fromBase64Url(hash.replace(/^#/, ''))),
    );

    if (!Array.isArray(f) || !f.length) {
      return null;
    }

    const options = { ...defaultOptions };

    for (const key of Object.keys(options) as (keyof typeof options)[]) {
      if (typeof o?.[key] === 'boolean') {
        options[key] = o[key];
      }
    }

    return {
      files: f.map(([name, content]: [unknown, unknown]) => ({
        name: String(name),
        content: String(content),
      })),
      data: typeof d === 'string' ? d : '{}',
      options,
    };
  } catch {
    return null;
  }
}
