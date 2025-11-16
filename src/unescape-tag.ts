export function unescapeTag(v: string) {
  return v.replace(/\\([{}])/g, '$1')
}
