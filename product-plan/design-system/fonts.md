# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Font Usage

- **Headings:** DM Sans — `font-heading` class, weights 600-700
- **Body text:** Inter — `font-body` class, weights 400-500
- **Code/technical:** IBM Plex Mono — `font-mono` class, weights 400-500

## Tailwind Configuration

```js
// tailwind.config.js (Tailwind v3) or @theme (v4)
theme: {
  fontFamily: {
    heading: ['DM Sans', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['IBM Plex Mono', 'monospace'],
  },
}
```
