# Janja Filter Documentation

This document provides comprehensive documentation for all built-in Janja filters with examples.

## Table of Contents

- [String Filters](#string-filters)
- [Number Filters](#number-filters)
- [Array Filters](#array-filters)
- [Object Filters](#object-filters)
- [Date/DateTime Filters](#datedatetime-filters)
- [Text Processing Filters](#text-processing-filters)
- [Utility Filters](#utility-filters)
- [Async Filters](#async-filters)

## String Filters

### `capitalize`

Capitalizes the first letter of each word in a string.

```javascript
{{= "hello world" | capitalize }}
// Output: "Hello World"
```

### `lower`

Converts a string to lowercase.

```javascript
{{= "HELLO WORLD" | lower }}
// Output: "hello world"
```

### `upper`

Converts a string to uppercase.

```javascript
{{= "hello world" | upper }}
// Output: "HELLO WORLD"
```

### `trim`

Removes whitespace from both ends of a string.

```javascript
{{= "  hello world  " | trim }}
// Output: "hello world"
```

### `truncate`

Truncates a string to a specified length.

```javascript
{{= "This is a very long string" | truncate:10 }}
// Output: "This is a..."
```

### `replace`

Replaces all occurrences of a pattern in a string.

```javascript
{{= "hello world" | replace:"world":"there" }}
// Output: "hello there"
```

### `slugify`

Converts a string to a URL-friendly slug.

```javascript
{{= "Hello World!" | slugify }}
// Output: "hello-world"
```

### `wordCount`

Counts the number of words in a string.

```javascript
{{= "Hello world from Janja" | wordCount }}
// Output: 4
```

### `stripTags`

Removes HTML tags from a string.

```javascript
{{= "<p>Hello <strong>world</strong></p>" | stripTags }}
// Output: "Hello world"
```

## Number Filters

### `abs`

Returns the absolute value of a number.

```javascript
{{= -5 | abs }}
// Output: 5
```

### `ceil`

Rounds a number up to the nearest integer.

```javascript
{{= 4.2 | ceil }}
// Output: 5
```

### `round`

Rounds a number to a specified number of decimal places.

```javascript
{{= 4.567 | round:2 }}
// Output: 4.57
```

### `floor`

Rounds a number down to the nearest integer.

```javascript
{{= 4.9 | floor }}
// Output: 4
```

### `fixed`

Formats a number to a fixed number of decimal places.

```javascript
{{= 4.5678 | fixed:2 }}
// Output: "4.57"
```

### `percent`

Converts a decimal to a percentage.

```javascript
{{= 0.75 | percent:0 }}
// Output: "75%"
```

### `currency`

Formats a number as currency.

```javascript
{{= 1234.56 | currency:"USD":"en-US" }}
// Output: "$1,234.56"
```

### `add`

Adds two numbers.

```javascript
{{= 5 | add:3 }}
// Output: 8
```

### `sub`

Subtracts two numbers.

```javascript
{{= 5 | sub:3 }}
// Output: 2
```

### `mul`

Multiplies two numbers.

```javascript
{{= 5 | mul:3 }}
// Output: 15
```

### `div`

Divides two numbers.

```javascript
{{= 6 | div:3 }}
// Output: 2
```

### `max`

Returns the maximum value.

```javascript
{{= 5 | max:3:8:2 }}
// Output: 8
```

### `min`

Returns the minimum value.

```javascript
{{= 5 | min:3:8:2 }}
// Output: 2
```

### `sum`

Returns the sum of an array of numbers.

```javascript
{{= [1, 2, 3, 4, 5] | sum }}
// Output: 15
```

## Array Filters

### `length`

Returns the length of a string or array.

```javascript
{{= [1, 2, 3] | length }}
// Output: 3
```

### `first`

Returns the first element of an array or string.

```javascript
{{= [1, 2, 3] | first }}
// Output: 1
```

### `last`

Returns the last element of an array or string.

```javascript
{{= [1, 2, 3] | last }}
// Output: 3
```

### `join`

Joins array elements with a separator.

```javascript
{{= [1, 2, 3] | join:", " }}
// Output: "1, 2, 3"
```

### `split`

Splits a string by a separator.

```javascript
{{= "1,2,3" | split:"," }}
// Output: ["1", "2", "3"]
```

### `reverse`

Reverses an array or string.

```javascript
{{= [1, 2, 3] | reverse }}
// Output: [3, 2, 1]
```

### `sort`

Sorts an array or string.

```javascript
{{= [3, 1, 2] | sort }}
// Output: [1, 2, 3]
```

### `unique`

Removes duplicate values from an array or string.

```javascript
{{= [1, 2, 2, 3, 1] | unique }}
// Output: [1, 2, 3]
```

### `compact`

Removes null and undefined values from an array.

```javascript
{{= [1, null, 2, undefined, 3] | compact }}
// Output: [1, 2, 3]
```

### `slice`

Slices an array or string.

```javascript
{{= [1, 2, 3, 4, 5] | slice:1:4 }}
// Output: [2, 3, 4]
```

### `shuffle`

Randomly shuffles an array.

```javascript
{{= [1, 2, 3, 4, 5] | shuffle }}
// Output: [3, 1, 5, 2, 4] (random order)
```

### `chunk`

Splits an array into chunks of a specified size.

```javascript
{{= [1, 2, 3, 4, 5] | chunk:2 }}
// Output: [[1, 2], [3, 4], [5]]
```

### `pluck`

Extracts a specific property from an array of objects.

```javascript
{{= [{name: "Alice"}, {name: "Bob"}] | pluck:"name" }}
// Output: ["Alice", "Bob"]
```

### `map`

Maps an array of objects to a specific key.

```javascript
{{= [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}] | map:"name" }}
// Output: ["Alice", "Bob"]
```

### `groupby`

Groups an array of objects by a specific key.

```javascript
{{= [{type: "a"}, {type: "b"}, {type: "a"}] | groupby:"type" }}
// Output: { a: [{type: "a"}, {type: "a"}], b: [{type: "b"}] }
```

## Object Filters

### `keys`

Returns the keys of an object.

```javascript
{{= {name: "Alice", age: 30} | keys }}
// Output: ["name", "age"]
```

### `values`

Returns the values of an object.

```javascript
{{= {name: "Alice", age: 30} | values }}
// Output: ["Alice", 30]
```

### `entries`

Returns the key-value pairs of an object.

```javascript
{{= {name: "Alice", age: 30} | entries }}
// Output: [["name", "Alice"], ["age", 30]]
```

### `get`

Gets a nested value from an object using a path.

```javascript
{{= {user: {name: "Alice"}} | get:"user":"name" }}
// Output: "Alice"
```

### `pick`

Picks specific keys from an object.

```javascript
{{= {name: "Alice", age: 30, city: "NYC"} | pick:"name":"age" }}
// Output: {name: "Alice", age: 30}
```

### `omit`

Omits specific keys from an object.

```javascript
{{= {name: "Alice", age: 30, city: "NYC"} | omit:"age" }}
// Output: {name: "Alice", city: "NYC"}
```

### `defaults`

Sets default values for missing keys.

```javascript
{{= {name: "Alice"} | defaults:{age: 0, city: "Unknown"} }}
// Output: {name: "Alice", age: 0, city: "Unknown"}
```

### `merge`

Merges multiple objects.

```javascript
{{= {a: 1} | merge:{b: 2}:{c: 3} }}
// Output: {a: 1, b: 2, c: 3}
```

### `invert`

Inverts the keys and values of an object.

```javascript
{{= {name: "Alice", age: 30} | invert }}
// Output: {"Alice": "name", "30": "age"}
```

## Date/DateTime Filters

### `date`

Formats a date according to the specified format.

```javascript
{{= date | date:"ISO" }}
// Output: "2024-01-15T10:30:00.000Z"

{{= date | date:"date" }}
// Output: "2024-01-15"

{{= date | date:"locale" }}
// Output: "1/15/2024"
```

**Available formats:**
- `ISO` - ISO 8601 format (default)
- `date` - Date only (YYYY-MM-DD)
- `time` - Time only (HH:MM:SS)
- `locale` - Locale date string
- `locale-time` - Locale time string
- `locale-datetime` - Locale date and time string

### `timeAgo`

Returns a human-readable time ago string.

```javascript
{{= date | timeAgo }}
// Output: "5 minutes ago"
// Output: "2 hours ago"
// Output: "3 days ago"
// Output: "just now"
```

## Text Processing Filters

### `wordCount`

Counts the number of words in a string.

```javascript
{{= "Hello world from Janja" | wordCount }}
// Output: 4
```

### `stripTags`

Removes HTML tags from a string.

```javascript
{{= "<p>Hello <strong>world</strong></p>" | stripTags }}
// Output: "Hello world"
```

### `slugify`

Converts a string to a URL-friendly slug.

```javascript
{{= "Hello World! This is a Test" | slugify }}
// Output: "hello-world-this-is-a-test"
```

## Utility Filters

### `safe`

Marks a string as safe (not to be escaped).

```javascript
{{= "<div>Safe HTML</div>" | safe }}
// Output: <div>Safe HTML</div> (not escaped)
```

### `json`

Converts a value to a JSON string.

```javascript
{{= {name: "Alice", age: 30} | json:2 }}
// Output: "{\n  \"name\": \"Alice\",\n  \"age\": 30\n}"
```

### `fallback`

Returns a default value if the input is null or undefined.

```javascript
{{= null | fallback:"default" }}
// Output: "default"

{{= "" | fallback:"default":true }}
// Output: "default" (with anyFalsy=true)
```

### `repeat`

Repeats a string a specified number of times.

```javascript
{{= "hello " | repeat:3 }}
// Output: "hello hello hello "
```

### `urlencode`

Encodes a string for use in URLs.

```javascript
{{= "hello world" | urlencode }}
// Output: "hello%20world"
```

### `urldecode`

Decodes a URL-encoded string.

```javascript
{{= "hello%20world" | urldecode }}
// Output: "hello world"
```

### `even`

Checks if a number is even.

```javascript
{{= 4 | even }}
// Output: true
```

### `odd`

Checks if a number is odd.

```javascript
{{= 3 | odd }}
// Output: true
```

## Async Filters

### `fetchUrl`

Fetches content from a URL (async).

```javascript
{{= "https://api.example.com/data" | fetchUrl }}
// Output: Response body content
```

### `delay`

Delays the evaluation by a specified number of milliseconds (async).

```javascript
{{= "hello" | delay:1000 }}
// Output: "hello" (after 1 second delay)
```

## Chaining Filters

Filters can be chained for complex transformations:

```javascript
{{= "HELLO WORLD" | lower | capitalize }}
// Output: "Hello World"

{{= [1, 2, 3, 4, 5] | slice:1:4 | reverse }}
// Output: [4, 3, 2]

{{= "  hello world  " | trim | upper | slugify }}
// Output: "HELLO-WORLD"
```

## Creating Custom Filters

You can add custom filters to your renderer:

```javascript
import { Renderer } from 'janja';

const renderer = new Renderer({
  filters: {
    myFilter: (value, arg1) => {
      // Your filter logic
      return value.toUpperCase();
    },
  },
});

const result = await renderer.render('{{= "hello" | myFilter }}', {});
// Output: "HELLO"
```

## Best Practices

1. **Chain filters wisely** - Order matters when chaining filters
2. **Use safe() carefully** - Only use with trusted content to avoid XSS
3. **Validate input** - Ensure data types match filter expectations
4. **Performance** - Heavy filters like `shuffle` on large arrays can impact performance
5. **Async filters** - Use async filters sparingly as they add latency

## Migration from Other Template Engines

### Jinja2

Most Jinja2 filters have equivalent Janja filters:

| Jinja2 | Janja |
|--------|-------|
| `upper` | `upper` |
| `lower` | `lower` |
| `capitalize` | `capitalize` |
| `title` | `capitalize` |
| `trim` | `trim` |
| `striptags` | `stripTags` |
| `wordcount` | `wordCount` |
| `replace` | `replace` |
| `truncate` | `truncate` |
| `length` | `length` |
| `first` | `first` |
| `last` | `last` |
| `sort` | `sort` |
| `reverse` | `reverse` |
| `unique` | `unique` |
| `join` | `join` |
| `split` | `split` |
| `map` | `map` |
| `default` | `fallback` |
| `safe` | `safe` |
| `escape` | (auto-escape by default) |
| `jsonify` | `json` |

### Handlebars

Handlebars helpers can be converted to Janja filters:

```handlebars
{{uppercase name}}
```

```javascript
{{= name | upper }}
```

### EJS

EJS filters can be used directly in Janja:

```ejs
<%= name.toUpperCase() %>
```

```javascript
{{= name | upper }}
```
