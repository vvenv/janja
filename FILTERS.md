# Filters

A filter transforms a value: `{{= value | name }}` or `{{= value | name(argument, ...) }}`. Filters chain from left to right, and each applies to the single operand before it, so use parentheses to filter a whole expression: `{{= (a + b) | fixed }}`. The [specification](./SPEC.md) has the details.

The language has no array or object literals, so the examples that need one show the data they are rendered with. Where a result is not a string, it is passed through `json` to make it visible. Every example on this page is run by the test suite.

## String Filters

### `capitalize`

Capitalizes the first letter of each word.

```janja
{{= "hello world" | capitalize }}
```

Output: `Hello World`

### `lower`

Converts a string to lowercase.

```janja
{{= "HELLO WORLD" | lower }}
```

Output: `hello world`

### `upper`

Converts a string to uppercase.

```janja
{{= "hello world" | upper }}
```

Output: `HELLO WORLD`

### `trim`

Removes whitespace from both ends of a string.

```janja
[{{= "  hello world  " | trim }}]
```

Output: `[hello world]`

### `truncate`

Shortens a string to at most `maxLength` characters, ending it with `...` (or the string given as second argument).

```janja
{{= "This is a very long string" | truncate(10) }}
```

Output: `This is a ...`

```janja
{{= "This is a very long string" | truncate(10, "…") }}
```

Output: `This is a …`

### `replace`

Replaces every match of a pattern. The pattern is a regular expression.

```janja
{{= "hello world" | replace("world", "there") }}
```

Output: `hello there`

```janja
{{= "a1b22c" | replace("\d+", "-") }}
```

Output: `a-b-c`

### `repeat`

Repeats a string.

```janja
{{= "ab" | repeat(3) }}
```

Output: `ababab`

### `split`

Splits a string into an array.

```janja
{{= "1,2,3" | split(",") | json }}
```

Output: `["1","2","3"]`

### `slugify`

Converts a string to a URL-friendly slug.

```janja
{{= "Hello World! This is a Test" | slugify }}
```

Output: `hello-world-this-is-a-test`

### `wordCount`

Counts the words in a string.

```janja
{{= "Hello world from Janja" | wordCount }}
```

Output: `4`

### `stripTags`

Removes HTML tags from a string.

```janja
{{= html | stripTags }}
```

Data: `{ "html": "<p>Hello <strong>world</strong></p>" }`

Output: `Hello world`

### `urlencode`

Encodes a string for use in a URL.

```janja
{{= "tom & jerry" | urlencode }}
```

Output: `tom%20%26%20jerry`

### `urldecode`

Decodes a URL-encoded string.

```janja
{{= "hello%20world" | urldecode }}
```

Output: `hello world`

## Number Filters

### `abs`

Returns the absolute value.

```janja
{{= -5 | abs }}
```

Output: `5`

### `ceil`

Rounds up to the nearest integer.

```janja
{{= 4.2 | ceil }}
```

Output: `5`

### `round`

Rounds to a number of decimal places (default 0).

```janja
{{= 4.567 | round(2) }}
```

Output: `4.57`

```janja
{{= 4.567 | round }}
```

Output: `5`

### `fixed`

Formats with a fixed number of decimal places (default 2).

```janja
{{= 4.5 | fixed }}
```

Output: `4.50`

```janja
{{= 4.5678 | fixed(1) }}
```

Output: `4.6`

### `percent`

Formats a fraction as a percentage.

```janja
{{= 0.75 | percent }}
```

Output: `75%`

```janja
{{= 0.1234 | percent(1) }}
```

Output: `12.3%`

### `currency`

Formats a number as currency. Arguments: the currency code (default `"USD"`) and the locale (default `"en-US"`).

```janja
{{= 1234.56 | currency }}
```

Output: `$1,234.56`

```janja
{{= 1234.56 | currency("EUR") }}
```

Output: `€1,234.56`

### `add`

Adds a number.

```janja
{{= 5 | add(3) }}
```

Output: `8`

### `sub`

Subtracts a number.

```janja
{{= 5 | sub(3) }}
```

Output: `2`

### `mul`

Multiplies by a number.

```janja
{{= 5 | mul(3) }}
```

Output: `15`

### `div`

Divides by a number.

```janja
{{= 6 | div(3) }}
```

Output: `2`

### `max`

Returns the largest of the value and the arguments.

```janja
{{= 5 | max(3, 8, 2) }}
```

Output: `8`

### `min`

Returns the smallest of the value and the arguments.

```janja
{{= 5 | min(3, 8, 2) }}
```

Output: `2`

### `sum`

Adds up an array of numbers.

```janja
{{= numbers | sum }}
```

Data: `{ "numbers": [1, 2, 3, 4, 5] }`

Output: `15`

### `even`

Tests whether a number is even.

```janja
{{= 4 | even }}
```

Output: `true`

### `odd`

Tests whether a number is odd.

```janja
{{= 3 | odd }}
```

Output: `true`

## Array Filters

### `length`

Returns the length of an array or a string.

```janja
{{= items | length }}
```

Data: `{ "items": [1, 2, 3] }`

Output: `3`

```janja
{{= "hello" | length }}
```

Output: `5`

### `first`

Returns the first element of an array, or the first character of a string.

```janja
{{= items | first }}
```

Data: `{ "items": [1, 2, 3] }`

Output: `1`

### `last`

Returns the last element of an array, or the last character of a string.

```janja
{{= items | last }}
```

Data: `{ "items": [1, 2, 3] }`

Output: `3`

### `join`

Joins the elements with a separator (default: none).

```janja
{{= items | join(", ") }}
```

Data: `{ "items": [1, 2, 3] }`

Output: `1, 2, 3`

### `reverse`

Returns a reversed copy of an array or a string.

```janja
{{= items | reverse | json }}
```

Data: `{ "items": [1, 2, 3] }`

Output: `[3,2,1]`

```janja
{{= "abc" | reverse }}
```

Output: `cba`

### `sort`

Returns a sorted copy of an array or a string. Elements are compared as strings, like JavaScript's `Array.prototype.sort()` without a comparator.

```janja
{{= items | sort | json }}
```

Data: `{ "items": ["pear", "apple", "fig"] }`

Output: `["apple","fig","pear"]`

### `unique`

Removes duplicates from an array or a string.

```janja
{{= items | unique | json }}
```

Data: `{ "items": [1, 2, 2, 3, 1] }`

Output: `[1,2,3]`

### `compact`

Removes `null` and `undefined` elements.

```janja
{{= items | compact | json }}
```

Data: `{ "items": [1, null, 2, null, 3] }`

Output: `[1,2,3]`

### `slice`

Returns the part of an array or a string from `start` up to, but not including, `end`.

```janja
{{= items | slice(1, 4) | json }}
```

Data: `{ "items": [1, 2, 3, 4, 5] }`

Output: `[2,3,4]`

```janja
{{= "hello" | slice(1) }}
```

Output: `ello`

### `chunk`

Splits an array into arrays of a given size.

```janja
{{= items | chunk(2) | json }}
```

Data: `{ "items": [1, 2, 3, 4, 5] }`

Output: `[[1,2],[3,4],[5]]`

### `shuffle`

Returns a copy of an array in random order.

```janja
{{= items | shuffle | json }}
```

Data: `{ "items": [1, 2, 3, 4, 5] }`

### `pluck`

Reads one property of every element.

```janja
{{= people | pluck("name") | json }}
```

Data: `{ "people": [{ "name": "Alice", "team": "core" }, { "name": "Bob", "team": "docs" }, { "name": "Carol", "team": "core" }] }`

Output: `["Alice","Bob","Carol"]`

### `map`

Like `pluck`, with an optional default for elements that lack the property.

```janja
{{= people | map("nickname", "n/a") | json }}
```

Data: `{ "people": [{ "name": "Alice", "nickname": "Al" }, { "name": "Bob" }] }`

Output: `["Al","n/a"]`

### `groupby`

Groups the elements of an array by the value of a property.

```janja
{{= people | groupby("team") | json }}
```

Data: `{ "people": [{ "name": "Alice", "team": "core" }, { "name": "Bob", "team": "docs" }, { "name": "Carol", "team": "core" }] }`

Output: `{"core":[{"name":"Alice","team":"core"},{"name":"Carol","team":"core"}],"docs":[{"name":"Bob","team":"docs"}]}`

## Object Filters

### `keys`

Returns the keys of an object. Use it to loop over an object: `{{ for key of user | keys }}`.

```janja
{{= user | keys | json }}
```

Data: `{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

Output: `["name","age","city"]`

### `values`

Returns the values of an object.

```janja
{{= user | values | json }}
```

Data: `{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

Output: `["Alice",30,"NYC"]`

### `entries`

Returns the key-value pairs of an object.

```janja
{{= user | entries | json }}
```

Data: `{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

Output: `[["name","Alice"],["age",30],["city","NYC"]]`

### `get`

Reads a nested value by its path, without failing when a part of the path is missing.

```janja
{{= account | get("owner", "name") }}
```

Data: `{ "account": { "owner": { "name": "Alice" } } }`

Output: `Alice`

```janja
[{{= account | get("billing", "city") }}]
```

Data: `{ "account": { "owner": { "name": "Alice" } } }`

Output: `[]`

### `pick`

Returns an object with only the given keys.

```janja
{{= user | pick("name", "age") | json }}
```

Data: `{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

Output: `{"name":"Alice","age":30}`

### `omit`

Returns an object without the given keys.

```janja
{{= user | omit("age") | json }}
```

Data: `{ "user": { "name": "Alice", "age": 30, "city": "NYC" } }`

Output: `{"name":"Alice","city":"NYC"}`

### `defaults`

Fills in the keys an object does not have.

```janja
{{= user | defaults(fallbacks) | json }}
```

Data: `{ "user": { "name": "Alice" }, "fallbacks": { "age": 0, "city": "Unknown" } }`

Output: `{"age":0,"city":"Unknown","name":"Alice"}`

### `merge`

Merges objects; later ones win.

```janja
{{= a | merge(b, c) | json }}
```

Data: `{ "a": { "x": 1 }, "b": { "y": 2 }, "c": { "x": 3 } }`

Output: `{"x":3,"y":2}`

### `invert`

Swaps keys and values.

```janja
{{= codes | invert | json }}
```

Data: `{ "codes": { "ok": 200, "missing": 404 } }`

Output: `{"200":"ok","404":"missing"}`

## Date Filters

### `date`

Formats a `Date`, or a string that JavaScript can parse as a date. An invalid date gives an empty string.

| Format | Result |
| ------ | ------ |
| `"ISO"` (default) | ISO 8601 |
| `"date"` | `YYYY-MM-DD` |
| `"time"` | `HH:MM:SS`, in the time zone of the machine that renders |
| `"locale"`, `"locale-time"`, `"locale-datetime"` | Formatted for the locale of the machine that renders |

```janja
{{= published | date }}
```

Data: `{ "published": "2024-01-15T10:30:00.000Z" }`

Output: `2024-01-15T10:30:00.000Z`

```janja
{{= published | date("date") }}
```

Data: `{ "published": "2024-01-15T10:30:00.000Z" }`

Output: `2024-01-15`

### `timeAgo`

Describes how long ago a date was: `just now`, `5 minutes ago`, `2 hours ago`, `3 days ago`, ...

```janja
{{= published | timeAgo }}
```

Data: `{ "published": "2024-01-15T10:30:00.000Z" }`

## Utility Filters

### `safe`

Marks a string as trusted HTML, so it is written without escaping. Only use it for content you control: see [Security](./SECURITY.md).

```janja
{{= html }}
```

Data: `{ "html": "<b>bold</b>" }`

Output: `&lt;b&gt;bold&lt;/b&gt;`

```janja
{{= html | safe }}
```

Data: `{ "html": "<b>bold</b>" }`

Output: `<b>bold</b>`

### `json`

Serializes a value as JSON, optionally indented. The result is not escaped.

```janja
{{= user | json }}
```

Data: `{ "user": { "name": "Alice", "tags": ["a", "b"] } }`

Output: `{"name":"Alice","tags":["a","b"]}`

### `fallback`

Replaces `null` and `undefined` with a default. Pass `true` as second argument to replace every falsy value, such as `""` and `0`.

```janja
{{= nickname | fallback("Anonymous") }}
```

Output: `Anonymous`

```janja
[{{= "" | fallback("Anonymous") }}]
```

Output: `[]`

```janja
{{= "" | fallback("Anonymous", true) }}
```

Output: `Anonymous`

## Async Filters

### `fetchUrl`

Fetches a URL and returns the response body as text. The template waits for it.

```janja
{{= "https://api.example.com/motd" | fetchUrl }}
```

### `delay`

Returns the value after a number of milliseconds.

```janja
{{= "hello" | delay(1000) }}
```

## Chaining Filters

```janja
{{= "  HELLO WORLD  " | trim | lower | capitalize }}
```

Output: `Hello World`

```janja
{{= items | slice(1, 4) | reverse | join(" - ") }}
```

Data: `{ "items": [1, 2, 3, 4, 5] }`

Output: `4 - 3 - 2`

## Custom Filters

A filter is a function that receives the value followed by the arguments. Register filters with the `filters` option; they are added to the built-in ones, and may be `async`:

```typescript
import { Renderer } from 'janja';

const renderer = new Renderer({
  filters: {
    shout: (value: string, times = 1) => value.toUpperCase() + '!'.repeat(times),
  },
});

await renderer.render('{{= "hello" | shout(3) }}', {});
// "HELLO!!!"
```

Using a filter that is not registered is an error when the expression is evaluated; `validateTemplate()` and `janja check` report it beforehand.

## Coming from Jinja2

Most Jinja2 filters exist under the same name. These differ:

| Jinja2 | Janja |
| ------ | ----- |
| `title` | `capitalize` |
| `striptags` | `stripTags` |
| `wordcount` | `wordCount` |
| `default` | `fallback` |
| `tojson` | `json` |
| `escape` | not needed: output is escaped by default |
| `value \| truncate(10)` | the same; arguments always go in parentheses |
