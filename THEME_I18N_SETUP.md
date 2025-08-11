# Theme & i18n Setup

## Features Implemented

### Theme System
- **3 themes**: Light, Dark, System (follows OS preference)
- **Persistence**: Settings saved to localStorage
- **Auto-apply**: Theme changes applied immediately
- **Components**: ThemeToggle dropdown in header

### i18n System  
- **2 languages**: English (default), Vietnamese
- **File-based**: Translations in `src/i18n/index.ts`
- **Persistence**: Language preference saved to localStorage
- **Components**: LanguageToggle dropdown in header

## File Structure

```
src/
├── stores/
│   └── settings.ts          # Settings store with theme/i18n
├── i18n/
│   └── index.ts            # i18n configuration & translations
├── components/
│   ├── ThemeToggle.vue     # Theme dropdown component
│   └── LanguageToggle.vue  # Language dropdown component
└── views/
    └── Settings.vue        # Settings page with controls
```

## Usage

### Theme Toggle
- Click sun/moon/monitor icon in header
- Select from dropdown: Light, Dark, System
- Settings page also has theme selector

### Language Toggle  
- Click globe icon in header
- Select from dropdown: English, Vietnamese
- Settings page also has language selector

### Settings Persistence
- All settings automatically saved to localStorage
- Theme and language persist across app restarts
- Settings sync between header toggles and settings page

## Technical Details

### Theme Implementation
- Uses CSS `dark:` classes with Tailwind
- `darkMode: 'class'` in tailwind.config.js
- Toggles `dark` class on `document.documentElement`
- System theme uses `prefers-color-scheme` media query

### i18n Implementation
- Vue I18n v9 with Composition API
- Global `$t()` function available in templates
- `useI18n()` composable for script setup
- Automatic language switching with `setLanguage()`

### Store Integration
- Settings store watches for changes
- Automatically applies theme and language changes
- localStorage persistence with error handling
- TypeScript types for theme and language options

## Future Enhancements

- Add more languages (Chinese, Japanese, etc.)
- Custom theme colors
- Export/import settings
- Server-side settings sync
- Keyboard shortcuts for theme/language toggle
