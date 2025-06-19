# Sofia Internationalization (i18n) System

## Overview

Sofia now supports multiple languages using React-i18next. The system is configured to support:
- **English (en)** - Default language
- **Spanish (es)** - Full translation support
- **Catalan (ca)** - Partial support (falls back to Spanish)

## Quick Start

### Using translations in components

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['modules', 'common']);
  
  return (
    <div>
      <h1>{t('modules:newModule')}</h1>
      <button>{t('common:save')}</button>
    </div>
  );
};
```

### Available Namespaces

- **common** - Basic UI elements (save, cancel, edit, delete, etc.)
- **navigation** - Navigation items (dashboard, content, planner, etc.)
- **modules** - Module-related text (newModule, editModule, etc.)
- **learning** - Learning situation text (newLearningSituation, etc.)

## Language Switcher

The language switcher is located in the main header (next to the logout button) and allows users to switch between:
- 🇺🇸 English
- 🇪🇸 Español  
- 🏴󠁥󠁳󠁣󠁴󠁿 Català

Language preference is automatically saved in localStorage.

## Adding New Translations

### 1. Add to English (required)
```json
// src/i18n/resources/en/[namespace].json
{
  "newKey": "English text"
}
```

### 2. Add to Spanish
```json
// src/i18n/resources/es/[namespace].json
{
  "newKey": "Texto en español"
}
```

### 3. Add to Catalan (optional)
```json
// src/i18n/resources/ca/[namespace].json
{
  "newKey": "Text en català"
}
```

## Translation Keys with Variables

Use interpolation for dynamic content:

```json
{
  "moduleCreated": "Module \"{{title}}\" created successfully"
}
```

```jsx
t('modules:moduleCreated', { title: 'My Module' })
// Result: "Module "My Module" created successfully"
```

## Example Migration

**Before:**
```jsx
<h1>{isEditMode ? 'Edit Module' : 'New Module'}</h1>
<button>Save</button>
<button>Cancel</button>
```

**After:**
```jsx
const { t } = useTranslation(['modules', 'common']);

<h1>{isEditMode ? t('modules:editModule') : t('modules:newModule')}</h1>
<button>{t('common:save')}</button>
<button>{t('common:cancel')}</button>
```

## File Structure

```
src/i18n/
├── index.js                 # Main configuration
└── resources/
    ├── en/                  # English translations
    │   ├── common.json
    │   ├── navigation.json
    │   ├── modules.json
    └── └── learning.json
    ├── es/                  # Spanish translations
    │   ├── common.json
    │   ├── navigation.json
    │   ├── modules.json
    └── └── learning.json
    └── ca/                  # Catalan translations
        └── common.json
```

## Current Implementation Status

✅ **Completed:**
- i18n infrastructure setup
- Language switcher in main header
- Translation files for EN/ES/CA
- Example implementation in ModuleCreationPageRefactored

🔄 **Next Steps:**
- Migrate remaining components
- Complete Catalan translations
- Add form validation messages
- Add educational content translations

## Best Practices

1. **Use namespaces** to organize translations logically
2. **Provide fallbacks** for missing translations
3. **Keep keys descriptive** but concise
4. **Use interpolation** for dynamic content
5. **Test all languages** before deploying 