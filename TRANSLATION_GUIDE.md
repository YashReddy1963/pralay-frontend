# Multilingual Translation System

This project implements a comprehensive multilingual system using `react-i18next` with role-scoped translations.

## Features

- **Role-based translations**: Separate translation contexts for Citizen, Official, and Admin roles
- **5 languages supported**: English, Hindi, Marathi, Gujarati, Tamil, Telugu
- **Dynamic language switching**: Instant UI updates when language changes
- **Persistent settings**: Language preferences saved per role
- **Scalable architecture**: Easy to add new languages and translations

## Architecture

### Translation Files Structure
```
src/locales/
├── en/
│   ├── common.json      # Shared translations (buttons, labels, etc.)
│   ├── citizen.json     # Citizen-specific translations
│   ├── official.json    # Official dashboard translations
│   └── admin.json       # Admin panel translations
├── hi/
│   ├── common.json      # Hindi shared translations
│   ├── citizen.json     # Hindi citizen translations
│   ├── official.json    # Hindi official translations
│   └── admin.json       # Hindi admin translations
└── [other languages]/
```

### Context Providers
- `CitizenLanguageProvider`: Wraps citizen app routes
- `OfficialLanguageProvider`: Wraps official dashboard routes  
- `AdminLanguageProvider`: Wraps admin panel routes

## Usage

### In Components

```tsx
import { useCitizenLanguage } from "@/contexts/LanguageContext";

const MyComponent = () => {
  const { t, language, setLanguage } = useCitizenLanguage();
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <button onClick={() => setLanguage("hi")}>
        Switch to Hindi
      </button>
    </div>
  );
};
```

### Translation Keys

Use dot notation for nested keys:
```tsx
t("settings.appearance")           // settings.appearance
t("hazardMap.totalReports")        // hazardMap.totalReports
t("common.save")                   // common.save
```

### Interpolation

Use variables in translations:
```json
{
  "reportsCount": "Reports ({{count}})",
  "showingResults": "Showing {{filtered}} of {{total}} results"
}
```

```tsx
t("reportsCount", { count: 42 })
t("showingResults", { filtered: 10, total: 100 })
```

## Adding New Languages

1. Create language directory in `src/locales/`
2. Add translation files:
   - `common.json`
   - `citizen.json`
   - `official.json`
   - `admin.json`
3. Update `src/i18n/index.ts` to include new language resources
4. Add language option to dropdowns in settings pages

### Example: Adding Bengali

```typescript
// In i18n/index.ts
import bnCommon from '../locales/bn/common.json';
import bnCitizen from '../locales/bn/citizen.json';
// ... other imports

const citizenResources = {
  // ... existing languages
  bn: {
    common: bnCommon,
    citizen: bnCitizen,
  },
};
```

## Adding New Translations

1. Add keys to appropriate JSON files
2. Use the `t()` function in components
3. Test with language switching

### Example: Adding a new citizen feature

```json
// src/locales/en/citizen.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature",
    "button": "Activate Feature"
  }
}
```

```tsx
// In component
<h1>{t("newFeature.title")}</h1>
<p>{t("newFeature.description")}</p>
<Button>{t("newFeature.button")}</Button>
```

## Best Practices

1. **Use semantic keys**: `hazardMap.totalReports` instead of `text1`
2. **Group related translations**: Use nested objects for organization
3. **Consistent naming**: Follow existing patterns
4. **Fallback gracefully**: Always provide English fallbacks
5. **Test thoroughly**: Verify all languages work correctly

## Current Implementation Status

- ✅ English (complete)
- ✅ Hindi (partial - citizen and official done)
- ⏳ Marathi, Gujarati, Tamil, Telugu (placeholder)

## Testing

1. Start the development server: `npm run dev`
2. Navigate to different role sections:
   - `/citizen/settings` - Test citizen translations
   - `/dashboard/settings` - Test official translations  
   - `/admin/settings` - Test admin translations
3. Switch languages and verify UI updates instantly
4. Refresh page to ensure language persistence

## Performance Notes

- Translations are loaded dynamically per role
- Language switching is optimized to avoid unnecessary re-renders
- Local storage caches language preferences
- Fallback to English ensures no broken UI

## Troubleshooting

**Translation not showing**: Check if key exists in JSON files
**Context error**: Ensure component is wrapped in correct language provider
**Type errors**: Use proper typing for `t()` function return values
**Performance issues**: Check for unnecessary re-renders in components
