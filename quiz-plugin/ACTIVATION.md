# Quiz Plugin Activation

The Quiz Plugin can be activated in two ways:

## Option 1: Via Marketplace (Recommended for Community Plugins)

1. Go to **Admin > Marketplace**
2. In **Developer Mode**, enter the plugin URL:
   - If deployed with backend JAR: `/static/plugins/quiz/quiz.mjs`
   - If hosted externally: `https://cdn.example.com/quiz.mjs`
3. Click **"Install"** to persist the plugin

The plugin will automatically load on page refresh.

## Option 2: Via Config File (For Built-in Plugins)

Add the Quiz Plugin to your config file's `pluginNamespace` array:

```typescript
// plugins/your-university/implementations/config/config.ts
export const config = {
  app: {
    pluginNamespace: [
      "core",
      "episodes",
      "series",
      "upload",
      "admin",
      {
        quiz: {
          types: ["app"], // Enable quiz:app plugin
        },
      },
    ],
  },
};
```

### Plugin Naming Convention

The Quiz Plugin uses:
- **Namespace**: `quiz`
- **Type**: `app`

So the full plugin name is: `quiz:app`

### Config Format

The `pluginNamespace` array supports two formats:

1. **Simple string** - Enable all types for a namespace:
   ```typescript
   "quiz" // Enables all quiz:* plugins
   ```

2. **Object with types** - Enable specific types:
   ```typescript
   {
     quiz: {
       types: ["app"], // Only enable quiz:app
     },
   }
   ```

### Important Notes

- **Config plugins** (`quiz:config`) are **always loaded** regardless of config
- If a namespace is **not** in `pluginNamespace`, it's **disabled**
- If a namespace is in `pluginNamespace` but no types are specified, **all types** are enabled

### Example: Multiple Plugins

```typescript
export const config = {
  app: {
    pluginNamespace: [
      "core",
      "episodes",
      "series",
      "upload",
      {
        quiz: {
          types: ["app"],
        },
        univie: {
          types: ["config", "app", "footer", "sidebar"],
        },
        admin: {
          types: ["app"], // Marketplace plugin
        },
      },
    ],
  },
};
```
