const special = /[&<>"']/;

const specials = /[&<>"']/g;

const entities: Record<string, string> = {
  '&': '&amp;',
  '"': '&#34;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
};

const entity = (char: string) => entities[char];

export function escape(v: unknown) {
  const str = typeof v === 'string' ? v : `${v}`;

  // Most values contain nothing to escape; they are returned as they are,
  // without allocating
  return special.test(str) ? str.replace(specials, entity) : str;
}
