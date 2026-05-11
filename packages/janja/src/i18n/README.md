# Janja Internationalization (i18n) Guide

This guide covers the internationalization features of Janja, including translation, pluralization, date/time formatting, and number formatting.

## Overview

Janja provides built-in i18n support through the `I18n` class, which allows you to:
- Translate text in templates
- Handle pluralization for different languages
- Format dates and times according to locale
- Format numbers and currency according to locale
- Load translations from JSON or YAML files

## Basic Usage

### Setting Up I18n

```typescript
import { I18n } from 'janja';

const i18n = new I18n({
  defaultLocale: 'en',
  locale: 'en',
  translations: {
    en: {
      hello: 'Hello',
      welcome: 'Welcome, {{name}}!',
    },
    es: {
      hello: 'Hola',
      welcome: '¡Bienvenido, {{name}}!',
    },
  },
});
```

### Translating Text

```typescript
// Simple translation
i18n.t('hello'); // 'Hello'

// With parameters
i18n.t('welcome', { name: 'John' }); // 'Welcome, John!'

// Nested keys
i18n.t('messages.inbox'); // 'Inbox'
```

### Changing Locale

```typescript
i18n.setLocale('es');
i18n.t('hello'); // 'Hola'
```

## Using i18n in Templates

### Register i18n Filters

```typescript
import { Renderer } from 'janja';
import { i18nFilters } from 'janja/src/i18n/filters';

const renderer = new Renderer({
  filters: {
    ...i18nFilters,
  },
});
```

### Template Examples

```janja
<!-- Simple translation -->
{{ t('hello') }}

<!-- Translation with parameters -->
{{ t('welcome', { name: user.name }) }}

<!-- Pluralization -->
{{ pluralize('items', itemCount) }}

<!-- Date formatting -->
{{ formatDate(date) }}

<!-- Number formatting -->
{{ formatNumber(price) }}

<!-- Currency formatting -->
{{ formatCurrency(amount, 'USD') }}
```

## Pluralization

Janja supports language-specific pluralization rules for many languages.

### Translation Keys Structure

```json
{
  "items": {
    "one": "1 item",
    "other": "{{count}} items"
  }
}
```

### Usage

```typescript
i18n.pluralize('items', 1); // '1 item'
i18n.pluralize('items', 5); // '5 items'
```

### Supported Plural Forms

- **zero**: Used for zero items (Arabic)
- **one**: Used for singular items (English, Spanish, etc.)
- **two**: Used for exactly two items (Arabic)
- **few**: Used for small numbers (Russian, Polish, etc.)
- **many**: Used for large numbers (Russian, Arabic, etc.)
- **other**: Used for all other cases

### Languages with Built-in Plural Rules

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Russian (ru)
- Japanese (ja) - no plural
- Chinese (zh) - no plural
- Arabic (ar)

## Date and Time Formatting

```typescript
// Simple date formatting
i18n.formatDate(new Date()); // '1/15/2024'

// With options
i18n.formatDate(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}); // 'January 15, 2024'
```

## Number Formatting

```typescript
// Simple number formatting
i18n.formatNumber(1234.56); // '1,234.56'

// With options
i18n.formatNumber(1234.56, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}); // '1,234.56'
```

## Currency Formatting

```typescript
i18n.formatCurrency(1234.56, 'USD'); // '$1,234.56'
i18n.formatCurrency(1234.56, 'EUR'); // '€1,234.56'
```

## Loading Translations from Files

### JSON Format

Create a directory structure like:

```
locales/
  en.json
  es.json
  fr.json
```

**en.json:**
```json
{
  "hello": "Hello",
  "welcome": "Welcome, {{name}}!"
}
```

**es.json:**
```json
{
  "hello": "Hola",
  "welcome": "¡Bienvenido, {{name}}!"
}
```

### Loading Files

```typescript
import { createI18nWithLoader } from 'janja/src/i18n/loader';

const i18n = await createI18nWithLoader({
  defaultLocale: 'en',
  directory: './locales',
  format: 'json',
});
```

### YAML Format (Experimental)

Janja includes a simple YAML parser for basic cases. For complex YAML files, use a dedicated YAML library.

```yaml
# en.yaml
hello: Hello
welcome: Welcome, {{name}}!
messages:
  inbox: Inbox
  sent: Sent
```

```typescript
const i18n = await createI18nWithLoader({
  defaultLocale: 'en',
  directory: './locales',
  format: 'yaml',
});
```

## Advanced Usage

### Custom Plural Rules

```typescript
const i18n = new I18n({
  pluralRules: {
    mylang: (n) => {
      // Custom pluralization logic
      return n === 1 ? 'one' : 'other';
    },
  },
});
```

### Merging Translations

```typescript
i18n.addTranslations('en', {
  newKey: 'New translation',
});
```

### Fallback Behavior

If a translation is not found in the current locale, Janja falls back to the default locale:

```typescript
i18n.setLocale('es');
i18n.t('hello'); // 'Hola' (from es)
i18n.t('nonexistent'); // 'nonexistent' (key returned if not found)
```

## Best Practices

1. **Organize translations by feature**: Use nested keys to group related translations
   ```json
   {
     "auth": {
       "login": "Login",
       "logout": "Logout"
     },
     "navigation": {
       "home": "Home",
       "about": "About"
     }
   }
   ```

2. **Use descriptive keys**: Avoid using the actual text as the key
   ```json
   {
     "user.greeting": "Hello" // Good
     "hello": "Hello" // Avoid if possible
   }
   ```

3. **Handle missing translations**: Always have a fallback strategy
   ```typescript
   const translation = i18n.t(key) || key;
   ```

4. **Test pluralization**: Test with different numbers to ensure plural rules work correctly

5. **Use locale-aware formatting**: Always use `formatDate`, `formatNumber`, and `formatCurrency` for user-facing content

## Integration with Renderer

To use i18n filters in your templates, register them with the Renderer:

```typescript
import { Renderer } from 'janja';
import { i18n, i18nFilters } from 'janja/src/i18n';

const renderer = new Renderer({
  filters: {
    ...i18nFilters,
  },
  globals: {
    i18n, // Also make i18n instance available globally
  },
});

// Set locale before rendering
i18n.setLocale('es');
await renderer.render(template, data);
```

## Performance Considerations

- Translations are cached in memory after loading
- Date/time and number formatting uses native Intl API (efficient)
- Pluralization rules are pre-defined and fast
- For large translation files, consider lazy loading

## Browser Support

The i18n features use the native `Intl` API, which is supported in all modern browsers:
- Chrome 24+
- Firefox 29+
- Safari 10+
- Edge 12+
- Node.js 0.12+

For older browsers, consider using a polyfill like `intl`.

## Example: Complete Setup

```typescript
import { Renderer } from 'janja';
import { createI18nWithLoader } from 'janja/src/i18n/loader';

// Initialize i18n with translations from files
const i18n = await createI18nWithLoader({
  defaultLocale: 'en',
  directory: './locales',
  format: 'json',
});

// Create renderer with i18n filters
const renderer = new Renderer({
  filters: {
    t: i18n.t.bind(i18n),
    pluralize: i18n.pluralize.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
  },
  globals: {
    i18n,
  },
});

// Render template with i18n
i18n.setLocale('es');
const result = await renderer.render(template, data);
```

## Template Example with i18n

```janja
<!DOCTYPE html>
<html>
<head>
  <title>{{ t('page.title') }}</title>
</head>
<body>
  <h1>{{ t('welcome', { name: user.name }) }}</h1>
  
  <p>{{ pluralize('messages.count', messageCount) }}</p>
  
  <p>Date: {{ formatDate(currentDate) }}</p>
  
  <p>Price: {{ formatCurrency(price, 'USD') }}</p>
</body>
</html>
```

## See Also

- [Janja Documentation](../../README.md)
- [Filter Reference](../../documentation.md)
- [API Documentation](../../documentation.md)
