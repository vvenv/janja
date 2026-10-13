export function escape(v: unknown) {
  const str = typeof v === 'string' ? v : `${v}`;

  // A single scan without regular expressions. Most values contain nothing
  // to escape; they are returned as they are, without allocating.
  let result = '';
  let last = 0;

  for (let i = 0; i < str.length; i++) {
    let entity: string;

    switch (str.charCodeAt(i)) {
      case 38:
        entity = '&amp;';

        break;
      case 34:
        entity = '&#34;';

        break;
      case 39:
        entity = '&#39;';

        break;
      case 60:
        entity = '&lt;';

        break;
      case 62:
        entity = '&gt;';

        break;
      default:
        continue;
    }

    result += str.slice(last, i) + entity;
    last = i + 1;
  }

  return last === 0 ? str : result + str.slice(last);
}
