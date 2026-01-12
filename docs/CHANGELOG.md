# Changelog

All notable changes to the **andb-ui** project will be documented in this file.

## [Unreleased] - 2026-01-12

### ✨ Features

- **Security & Portability**:
  - **Master Password for Backups**: Implemented AES-256-CBC encryption for exported data, allowing for secure and portable backups with a user-defined password.
  - **Immediate Invalidation**: Connected session data and in-memory passwords are now instantly cleared upon regenerating security keys for maximum privacy.
- **Connection Management**:
  - **Pull-Sync Architecture**: Project connections now automatically fetch and synchronize the latest credentials and host settings from their linked Global Templates upon view entry.
  - **Automated Health Checks**: Added automatic connection testing when entering both Project Connection and Global Template management views.
  - **Unified Actions UI**: Standardized connection test feedback with persistent, icon-based status indicators (Success/Failure/Testing) across the entire application.
- **UI/UX Accessibility**:
  - **Typography Pass**: Conducted a comprehensive font size audit in Settings, increasing minimum label sizes from 9px/10px to a more readable 12px/14px.
  - **Table Refinement**: Improved the layout of connection lists with dedicated database columns and pill-style badges for better information density.

### 🛠 Technical

- **Security Service Integration**: Enhanced the Electron main process with dedicated IPC handlers for backup encryption/decryption.
- **Reactive Synchronization**: Implemented reliable 'watch'-based auto-testing to handle asynchronous data loading in connection managers.
- **Codebase Cleanup**: Removed obsolete synchronization actions and unused state variables to improve maintainability.

### 🚀 Roadmap (Coming Soon)

- **Project Focus Mode**: A distraction-free workspace mode for high-density connection management.
- **One-Click Migration**: Automated execution of schema changes across environments (currently available as SQL preview for manual execution).
