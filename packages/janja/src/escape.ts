const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '"': '&#34;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
};

const escapeRegex = /[&"'<>]/g;

export function escape(v: unknown) {
  const str = `${v}`;

  return str.replace(escapeRegex, (char) => escapeMap[char]);
}
