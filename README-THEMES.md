# Example themes (.local-plugins)

These themes live under `.local-plugins/<name>/themes/<name>.css` and are loaded in **dev** when `config.app.theme` is set to the theme name.

## How to switch theme

In **`.local-plugins/config/src/config.ts`**, set:

```ts
app: {
  theme: "compact",  // or "rounded" | "minimal" | "warm" | "univie" | "default"
  // ...
}
```

Restart or refresh the app to see the new theme.

## Available example themes

| Theme     | Description |
|----------|-------------|
| **compact** | Dense UI: small radius, tight spacing, minimal shadows, neutral palette. |
| **rounded** | Soft, friendly: large radius (1rem), soft shadows, relaxed spacing, blue accent. |
| **minimal** | Editorial: zero radius, no shadows, strong borders, high contrast. Uncomment serif font in the CSS to try a serif body. |
| **warm**    | Cozy: cream/amber palette, medium radius, soft shadows. |

## Adding your own theme

1. Create `.local-plugins/<your-theme>/themes/<your-theme>.css`.
2. Override any variables from `packages/ui/src/styles/globals.css` (`:root` and `.dark`): colors, `--radius`, `--font-sans`, `--spacing-*`, `--shadow-*`, `--duration-transition`, etc.
3. Set `app.theme` to `"your-theme"` in config.

No plugin code (e.g. `dist/*.mjs`) is required for theme-only folders; the dev server serves the CSS from the theme path.
