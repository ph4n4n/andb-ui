# Changelog

All notable changes to the **andb-ui** project will be documented in this file.

## [Unreleased] - 2025-12-31

### ✨ Features

- **Atomic Operations**:
  - **Smart Refresh**: Refresh individual objects (tables, procedures, etc.) or specific categories instead of reloading the entire schema.
  - **Atomic Compare**: Compare specific objects or categories directly from the UI, significantly reducing wait times.
- **Schema Viewer Enhancements**:
  - **Syntax Highlighting**: Added "Rainbow" highlighting for brackets and parentheses to improve code readability.
  - **Line Numbers**: Added a dedicated line number column to the DDL viewer.
  - **Status Indicators**: Changed "Identical" status color to **Teal** for better visibility and positive reinforcement.
- **Sidebar & Navigation**:
  - **Environment Sorting**: Enforced logical order: `DEV -> STAGE -> UAT -> PROD`.
  - **Auto-Navigation**: Clicking a Sidebar item now automatically redirects to the Schema view.
- **Dashboard**:
  - **Reset Data Modal**: Added a comprehensive confirmation modal for resetting data, detailing exactly what will be deleted (Cached Schemas, Comparison Results, Logs).

### 🐛 Fixes

- **Timezone Issue**: Fixed "Last Synced" time displaying incorrectly due to SQLite UTC timestamp handling.
- **UI Polish**:
  - Removed `border-radius` from Console Output for a cleaner layout.
  - Improved Dark Mode contrast for syntax highlighting.
  - Fixed "Identical" status looking disabled (gray) by changing to Teal.

### 🛠 Technical

- **SQLite Storage**: Enhanced caching strategy to support atomic updates (merging partial refreshes into the main cache).
- **Refactoring**: Cleaned up `Sidebar.vue` and `Schema.vue` to handle atomic events better.
