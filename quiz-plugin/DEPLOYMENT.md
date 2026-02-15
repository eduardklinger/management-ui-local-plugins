# Quiz Plugin Deployment Guide

## Frontend im JAR

**Nein, du brauchst kein separates Frontend-JAR!** Das Frontend-Plugin ist bereits im Backend-JAR enthalten.

### Wie es funktioniert:

1. **Build-Prozess:**
   ```bash
   # 1. Frontend bauen
   cd plugins/quiz-plugin
   pnpm build
   
   # 2. Backend bauen (kopiert automatisch Frontend ins JAR)
   cd ../../backend/quiz-plugin
   mvn clean install
   ```

2. **Was passiert:**
   - Das Frontend-Plugin (`quiz.mjs`) wird automatisch in das Backend-JAR kopiert
   - Es landet in: `target/classes/static/plugins/quiz/quiz.mjs`
   - Wird über REST-Endpoint serviert: `/static/plugins/quiz/quiz.mjs`

3. **Deployment:**
   ```bash
   # Nur EIN JAR deployen:
   cp backend/quiz-plugin/target/quiz-plugin-backend-1.0-SNAPSHOT.jar \
      $OPENCAST_HOME/deploy/
   ```

## Sidebar Navigation

Der Quiz-Eintrag in der Sidebar erscheint **automatisch**, wenn das Plugin geladen wird.

### Wie es funktioniert:

Das Quiz-Plugin registriert den Sidebar-Eintrag in `initialize()`:

```typescript
manager.registerObject("sidebar:nav-items", "quiz-nav", {
  title: "Quiz",
  path: "/quiz",
  icon: HelpCircle,
  order: 150,
});
```

### Aktivierung

Du hast zwei Optionen:

#### Option 1: Via Marketplace (Empfohlen)

1. Backend-JAR deployen (wie oben)
2. Frontend-Plugin installieren:
   - Admin > Marketplace > Developer Mode
   - URL: `/static/plugins/quiz/quiz.mjs`
   - Klicke "Install"

Der Sidebar-Eintrag erscheint automatisch nach Installation.

#### Option 2: Via Config

Füge das Quiz-Plugin zu deiner Config hinzu:

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
          types: ["app"], // ✅ Das ist korrekt!
        },
      },
    ],
  },
};
```

**Wichtig:** `types: ["app"]` ist ausreichend! Du musst **keine weiteren types** hinzufügen.

### Warum `types: ["app"]` ausreicht:

- Das Quiz-Plugin hat `namespace: "quiz"` und `type: "app"`
- Der Sidebar-Eintrag wird über `registerObject("sidebar:nav-items", ...)` registriert
- Das ist ein **Extension Point**, kein separater Plugin-Type
- Extension Points werden automatisch aktiviert, wenn das Plugin geladen wird

### Plugin-Types vs. Extension Points

| Konzept | Beispiel | Wird in Config aktiviert? |
|---------|----------|---------------------------|
| **Plugin-Type** | `quiz:app` | ✅ Ja, via `types: ["app"]` |
| **Extension Point** | `sidebar:nav-items` | ❌ Nein, automatisch aktiv |

### Troubleshooting

**Problem:** Sidebar-Eintrag erscheint nicht

**Lösungen:**
1. Prüfe, ob das Plugin geladen wurde:
   - Browser Console: Suche nach `"Quiz Plugin activated"`
   - Marketplace: Prüfe, ob Plugin in "Installed Plugins" steht

2. Prüfe Config:
   - Ist `quiz: { types: ["app"] }` in `pluginNamespace`?
   - Wurde die Config neu geladen?

3. Prüfe Plugin-Registrierung:
   - Browser Console: `window.__PLUGIN_MANAGER__?.getAllObjects("sidebar:nav-items")`
   - Sollte `quiz-nav` enthalten

## Zusammenfassung

✅ **Frontend im JAR:** Bereits enthalten, kein separates JAR nötig  
✅ **Sidebar Navigation:** Automatisch, wenn Plugin geladen wird  
✅ **Config:** `types: ["app"]` ist ausreichend, keine weiteren types nötig
