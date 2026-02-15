# Config Fix für Quiz Plugin

## Problem

Die Config hat eine falsche Struktur. `"quiz"` muss ein **separates Objekt** im Array sein, nicht im selben Objekt wie `"univie"`.

## Falsch ❌

```json
{
  "pluginNamespace": [
    {
      "univie": { ... },
      "quiz": { "types": ["app"] }  // ❌ Falsch: im selben Objekt
    }
  ]
}
```

## Richtig ✅

```json
{
  "pluginNamespace": [
    "core",
    "episodes",
    "series",
    "upload",
    {
      "univie": {
        "types": ["config", "app", "footer", "landing-page", "sidebar", "navigation"]
      }
    },
    {
      "quiz": {
        "types": ["app"]
      }
    }
  ]
}
```

## Wichtig

- Jedes Plugin-Namespace muss ein **separates Objekt** im Array sein
- Jedes Objekt hat **genau einen** Key (z.B. `"quiz"`)
- Der Value ist ein Objekt mit `types` Array

## Deine korrigierte Config:

```json
{
  "app": {
    "pluginNamespace": [
      "core",
      "episodes",
      "series",
      "upload",
      {
        "univie": {
          "types": [
            "config",
            "app",
            "footer",
            "landing-page",
            "sidebar",
            "navigation"
          ]
        }
      },
      {
        "quiz": {
          "types": ["app"]
        }
      }
    ]
  }
}
```

**Wichtig:** `"quiz"` muss ein **separates Objekt** sein, nicht im `"univie"` Objekt!
