export async function loader(path: string) {
  return fetch(`templates/${path}.janja`).then((res) => res.text());
}
