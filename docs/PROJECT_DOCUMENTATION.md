# Projektdokumentation: Nuxt UI Theme Builder

Stand: 2025-08-08

Diese Dokumentation beschreibt Architektur, Module, Datenflüsse und Erweiterungspunkte des Projekts in `g:/www/nuxt-ui-theme-builder`.

---

## Überblick

- __Ziel__: Interaktiver Theme-Builder für Nuxt UI. Nutzer definieren Farben, mappen sie auf Nuxt UI Theme-Variablen, passen Komponentenkonfigurationen (Variants, Colors, Sizes, UI-Slots) an und exportieren lauffähige Konfigurationen (CSS + `app.config.ts`).
- __Framework__: Nuxt 4, Vue 3, Pinia.
- __UI__: Nuxt UI 3, Tailwind Merge (Klassen-Zusammenführung).
- __Server__: H3-Handler unter `server/api/`.
- __Wichtige Flows__: Farben verwalten → Theme-Variablen zuordnen → UI-Properties je Komponente konfigurieren → Live-Preview → Export.

---

## Tech-Stack

- __Nuxt 4__: `nuxt.config.ts` (Module: `@nuxt/ui`, `@nuxt/eslint`, `@pinia/nuxt`; globale `~/assets/css/main.css`; Auto-Imports für `~/components/`).
- __State Management__: Pinia (`app/store/`).
- __UI Bibliothek__: `@nuxt/ui` mit App-Config in `app/app.config.ts`.
- __Syntax-Highlighting__: Shiki über `useCodeHighlighter` (verwendet in `useThemeExport.ts`).
- __Build Scripts__: in `package.json` (`dev`, `build`, `generate`, `preview`, `lint`).

Siehe `package.json` für Abhängigkeiten und Scripts.

---

## Projektstruktur

- __Konfiguration__
  - `nuxt.config.ts`
  - `app/app.config.ts` (Nuxt UI Theme-Voreinstellungen)
- __App-Einstieg__
  - `app/app.vue` (Layout: Sidebar, Header, Page Content; init `useThemeCss()`)
- __Seiten__
  - `app/pages/index.vue` (Landing)
  - `app/pages/colors.vue` (Farben-Management)
  - `app/pages/preview.vue` (Marketing-/Komponenten-Preview)
  - `app/pages/components/...` (siehe `app/components/preview/` falls vorhanden)
- __Stores__
  - `app/store/colors.ts` (Farben CRUD, Auswahl)
  - `app/store/theme.ts` (Theme-/CSS-Variablen und Mappings)
  - `app/store/componentConfig.ts` (Komponenten-UI-Konfiguration je Variant/Color/Size/UI-Element)
- __Komponenten__
  - `app/components/AppHeader.vue` (Navigation, Export-Modal, Theme-Konfiguration)
  - `app/components/AppSidebar.vue` (Navigation, ggf. vorhanden)
  - `app/components/ColorListing.vue` (Farben CRUD UI)
  - `app/components/VariableConfigurator.vue` (Theme-Variablen + CSS-Variablen UI)
  - `app/components/ThemeMapping.vue` (Alternative/erweiterte Mapping-UI)
  - `app/components/ComponentPreview.vue` (Live-Zusammenführung UI-Klassen + Editor)
  - `app/components/ThemePreview.vue` (Wrapper für thematisches Preview)
- __Composables__
  - `app/composables/useThemeExport.ts` (Export-Flow: CSS + `app.config.ts`)
  - `app/composables/useThemeCss` (initialisiert globale CSS-Variablen; aufgerufen in `app.vue`)
  - `app/composables/useComponentPreviewConfig` (liefert UI-Elemente-Definitionen je Komponente; von `componentConfig` Store referenziert)
- __Server__
  - `server/api/export-theme.post.ts` (generiert Exportinhalte)
- __Typen & Utils__
  - `app/types/color.d.ts` (Farbtyp)
  - `app/utils/*` (z. B. `colorUtils`, `tailwindColors`)

---

## Kern-Module und Datenmodelle

- __Farben-Store__: `app/store/colors.ts`
  - State: `colors: Color[]`, `selectedColor: Color|null`
  - Aktionen: `addColor()`, `updateColor()`, `deleteColor()`, `selectColor()`, `clearSelection()`, `createEmptyColor()`
  - Typ `Color`: `app/types/color.d.ts` mit Shades `50`–`950`.
  - Hinweis: Diese Sektion folgt der zuvor implementierten Farbverwaltung.

- __Theme-Store__: `app/store/theme.ts`
  - Theme-Variablen: `ThemeVariable = 'primary'|'secondary'|'success'|'info'|'warning'|'error'`
  - CSS-Variablentypen: `CssVariableType = 'color-reference'|'direct-value'`
  - `predefinedCssVariables`: vordefinierte UI-Variablen (Text, Background, Border, Radius).
  - State:
    - `mappings: Record<ThemeVariable, string|null>` (Zuordnung Theme-Var → Farbnamen, z. B. "primary": "blue")
    - `cssVariableMappings: Record<string, CssVariableMapping>` (weitere CSS-Variablen)
  - Getter:
    - `getThemeVariables()`
    - `getCssVariables()`, `getCssVariablesByCategory()`, `getCssVariable(name)`
    - `getMapping(variable)`
    - `getThemeCssVariables()` baut finale CSS Variablen:
      - `--ui-{variable}` → Referenz auf `--ui-color-{color}-500`
      - `--ui-{variable}-{shade}` → Referenzen für alle Shades
      - zusätzliche CSS-Variablen: `color-reference` → `var(--ui-color-{color}-{shade})`, `direct-value` → z. B. `#fff`
  - Aktionen: `setMapping()`, `clearMapping()`, `clearAllMappings()`, `setCssVariableValue()`, `setCssVariableType()`, `updateCssVariable()`, `deleteCssVariable()`, `resetCssVariables()`
  - Hydration: `hydrate(state)` initialisiert `cssVariableMappings` aus `predefinedCssVariables`.

- __Komponenten-Config-Store__: `app/store/componentConfig.ts`
  - Ziel: Klassen-Konfiguration pro Komponente nach Property-Typen (__variants__, __colors__, __sizes__) und __UI-Element__ (z. B. `base`, Slot-spezifische Keys).
  - API:
    - `initComponentConfig()`, `initPropertyConfig()`
    - `setClasses(component, type, value, uiElement, classes[])`
    - `getClasses(component, type, value, uiElement)` → string[]
    - `getAllClasses(component, variant, color, size, uiElement='base')` → Merge in Reihenfolge
    - `clearComponentConfig(component)`, `importConfig()`, `exportConfig()`
    - `initComponentDefaults(component)` lädt Definitionen aus `useComponentPreviewConfig()` und erzeugt leere Defaults.

---

## Wichtige Komponenten

- __AppHeader__: `app/components/AppHeader.vue`
  - Navigation (`UNavigationMenu`), Buttons (Export, Theme-Konfiguration, Dark Mode).
  - Export-Modal nutzt `useThemeExport()` für Anzeige von generierten Inhalten (`main.css`, `app.config.ts`) inkl. Shiki-Highlighting.

- __VariableConfigurator__: `app/components/VariableConfigurator.vue`
  - Sektion 1: Theme-Variablen → `USelect` aus verfügbaren Farben; Vorschau Shades; schreibt nach `themeStore.mappings`.
  - Sektion 2: CSS-Variablen → pro Kategorie Editor:
    - Typ `color-reference` mit Farbauswahl und Shade-Picker.
    - Typ `direct-value` mit HEX/Textwert inkl. Farbvorschau.
  - Nutzt Tailwind-Farbhelpers (`getTailwindColorsAsColorObjects`, `isTailwindColor`) und Custom-Farben aus `colorsStore`.

- __ThemeMapping__: `app/components/ThemeMapping.vue`
  - Ähnliche Funktionalität wie `VariableConfigurator` mit detaillierter Shade-Interaktion und Vorschau. Nutzt `themeStore` intensiv.

- __ColorListing__: `app/components/ColorListing.vue`
  - CRUD-UI für Custom-Farben. `generateColorPalette(baseColorHex)` generiert Shades, Anzeige als Balken, modale Dialoge für Add/Edit/Delete.

- __ComponentPreview__: `app/components/ComponentPreview.vue`
  - Visualisiert Nuxt-UI-Komponenten dynamisch nach Variant/Color/Size.
  - Editor-Tabs: erlaubt Setzen/Mergen von Klassen für
    - __variants__: per `variantClasses[variant]`
    - __colors__: per `colorClasses[color]`
    - __sizes__: per `sizeClasses[size]`
    - __UI-Properties__: slot-/element-spezifische Klassen.
  - Merge-Logik via `tailwind-merge`: `getMergedClassesForProperty()`, `getMergedUiObject()` erzeugt ein vollständiges `ui`-Objekt.

- __ThemePreview__: `app/components/ThemePreview.vue`
  - Wrapper (display: contents) für konsistente Theme-Vorschau-Kontexte.

---

## Seiten

- __Home__: `app/pages/index.vue`
  - Einstieg, Hinweise auf Kernfunktionen, Navigations-Buttons.

- __Colors__: `app/pages/colors.vue`
  - Rendert `ColorListing`. Zentrale Seite für Farbmanagement.

- __Preview__: `app/pages/preview.vue`
  - Beispielhafte Komponenten-/Marketing-Layouts zur Sichtprüfung von Theme-Effekten.

---

## Export-Flow

- __Composables__: `app/composables/useThemeExport.ts`
  - Aggregiert:
    - `themeStore.getThemeCssVariables` (alle CSS-Variablen inkl. extra Variablen)
    - `colorsStore.getColors` (Custom-Farben)
    - `themeStore.mappings` (für `app.config.ts`)
  - POST an `server/api/export-theme.post.ts`
  - Zeigt Ergebnis in Modal (AppHeader), inkl. Syntax-Hervorhebung (Shiki).

- __API__: `server/api/export-theme.post.ts`
  - Request: `{ themeVariables, customColors?, themeMappings? }`
  - `generateCssContent(...)`:
    - Schreibt nur __nicht-Theme__ CSS-Variablen in `:root` (Theme-Variablen wie `--ui-primary` werden durch `app.config.ts` gesetzt).
    - Optional: Custom-Farben als `--color-{name}-{shade}` in `:root`.
  - `generateAppConfigContent(themeMappings)`:
    - Baut `defineAppConfig({ ui: { colors: { ... } } })` für Nuxt UI, z. B. `primary: 'amber'`.

---

## Theme & CSS-Variablen

- __Zentrale Quelle__: `themeStore.getThemeCssVariables()`
  - Erzeugt:
    - `--ui-primary`, `--ui-secondary`, ... und alle Shades als Referenzen zu `--ui-color-{name}-{shade}`.
    - Zusätzliche UI-Variablen (z. B. `--ui-text-muted`, `--ui-bg-elevated`, `--ui-radius`) je nach Typ.
- __Vorkonfiguriert__: `predefinedCssVariables` in `app/store/theme.ts`.

---

## Komponenten-Anpassungssystem

- __Klassen-Verwaltung__: `useComponentConfigStore()`
  - Granulare Steuerung pro Komponente, pro Variant/Color/Size, pro UI-Element.
- __Editor__: `ComponentPreview.vue`
  - UI, um Klassen je Achse zu pflegen; speichert über Store.
  - Liefert fertiges `ui`-Objekt an die gezeigte Komponente.

---

## App-Konfiguration

- __Standard-Theme__: `app/app.config.ts`
  - `ui.colors.primary = 'amber'`, `neutral = 'slate'`
  - Beispielslot-Override für `button.slots.base`.
- __Laufzeit-Überschreibung__: Der Export generiert eine neue `app.config.ts`, die die gemappten Farben setzt.

---

## Läufe & Build

- __Setup__: `npm|pnpm|yarn|bun install`
- __Entwicklung__: `npm run dev` → `http://localhost:3000`
- __Build__: `npm run build`, __Preview__: `npm run preview`

Siehe `README.md` für Kommandos.

---

## Erweiterungspunkte

- __Weitere Theme-Variablen__: `ThemeVariable` in `app/store/theme.ts` erweitern und UI in `VariableConfigurator.vue`/`ThemeMapping.vue` spiegeln.
- __Neue CSS-Variablen-Kategorien__: `predefinedCssVariables` erweitern; UI zeigt automatisch über `getCssVariablesByCategory()`.
- __Weitere Komponenten/Properties__: `useComponentPreviewConfig` erweitern, dann `initComponentDefaults(component)` aufrufen.
- __Export-Formate__: `server/api/export-theme.post.ts` anpassen (z. B. ZIP-Ausgabe, Download-Link).
- __Persistenz__: Optionale Speicherung von Stores (z. B. LocalStorage/DB) ergänzen.

---

## Bekannte Annahmen und Hinweise

- __Normalisierung der Farbnamen__: kleingeschrieben, Leerzeichen → `-` (z. B. `"Cool Gray"` → `cool-gray`), konsistent in Referenzen.
- __Shades__: Erwartet werden Strings `'50'..'950'`.
- __Theme-Variablen__: Über `app.config.ts` (Nuxt UI) gesteuert; API-Export filtert diese aus dem CSS-Block heraus.

---

## Relevante Dateien (Auswahl)

- `nuxt.config.ts`
- `app/app.vue`
- `app/app.config.ts`
- `app/store/colors.ts`
- `app/store/theme.ts`
- `app/store/componentConfig.ts`
- `app/components/AppHeader.vue`
- `app/components/VariableConfigurator.vue`
- `app/components/ThemeMapping.vue`
- `app/components/ColorListing.vue`
- `app/components/ComponentPreview.vue`
- `app/pages/colors.vue`
- `server/api/export-theme.post.ts`
- `app/composables/useThemeExport.ts`
- `app/types/color.d.ts`

---

## Änderungsverlauf / Herkunft

- Die Farbverwaltung (Store, Komponenten `ColorListing.vue`, Typen) basiert auf einer vorherigen Implementierung und ist in dieses Projekt integriert.
