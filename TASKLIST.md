# andb-ui Task List

## 🎯 Project Overview
Desktop application for andb-core database migration tool using Electron + Vue.js

## 📋 Phase 1: Setup & Foundation
- [x] Setup Electron + Vue.js project structure
- [x] Configure build pipeline (Vite/Webpack)
- [x] Setup TypeScript
- [x] Configure hot reload cho development
- [x] Setup basic routing (Vue Router)
- [x] Setup Tailwind CSS hoặc UI framework
- [ ] Configure ESLint + Prettier

## 🎨 Phase 2: UI Design & Components (PRIORITY)
### 2.1 Design System
- [x] Define color palette & typography
- [x] Create component library (buttons, inputs, cards, etc.)
- [x] Setup icon system (Lucide/Feather icons)
- [x] Create layout components (Sidebar, Header, Main content)

### 2.2 Main Layout Design
- [x] **Auto-hide Sidebar Navigation**: 
  - Toggle button (☰) in header
  - Database connections manager (multiple configs)
  - Connection pairs selector for compare/migrate
  - Main menu items (Export, Compare, Migrate, Scripts)
  - Connection status indicators
  - Keyboard shortcut (Ctrl+B) to toggle
  - Auto-hide when window width < 1200px
- [x] **Header**: 
  - Sidebar toggle button (☰)
  - Current active connections (Source ↔ Target)
  - Connection pair selector dropdown
  - Environment indicators (DEV/STAGE/PROD)
  - Quick actions (Test connections, Refresh)
- [x] **Resizable Dual-Pane Main Content**: 
  - Source and Destination panes side-by-side
  - Resize handle (⋮⋮) between panes
  - Auto-snap to 25%, 50%, 75% ratios
  - Min width: 200px, Max width: 800px per pane
  - Keyboard shortcuts (Ctrl+Left/Right) to adjust
  - Dynamic content based on route
  - Connection pair context (showing which DBs are being compared)
  - Loading states
  - Error handling UI
- [ ] **Connection Management Panel**:
  - Add/Edit/Delete database configurations
  - Connection testing interface
  - Environment grouping (DEV/STAGE/PROD)
  - Connection validation and status

### 2.3 Core UI Screens (Wireframes)
- [x] **Dashboard/Home**: Overview of all database connections and pairs
- [ ] **Connection Manager**: Form to add/edit multiple database configurations
- [x] **Connection Pair Selector**: Interface to choose Source ↔ Target for operations
- [x] **Export View (Dual-Pane)**: 
  - Left pane: Database objects list (tables/procedures/functions/triggers)
  - Right pane: SQL preview with syntax highlighting
  - Resizable panes with drag handle
- [x] **Compare View (Dual-Pane)**: 
  - Left pane: Source database objects
  - Right pane: Destination database objects
  - Side-by-side comparison with visual diff indicators
  - Resizable panes with drag handle
- [x] **Migration View (Dual-Pane)**: 
  - Left pane: Pending changes list
  - Right pane: Migration history
  - Resizable panes with drag handle
- [x] **Script Generator**: Generate scripts for selected connection pair
- [x] **Settings**: App configuration and connection preferences

## 🔧 Phase 3: Database Integration
- [ ] Install and integrate `andb-core` npm package
- [ ] Create wrapper functions for andb-core CLI commands
- [ ] **Multiple Database Connection Management**:
  - Store multiple database configurations
  - Connection validation and testing
  - Environment grouping (DEV/STAGE/PROD)
  - Connection pair management
- [ ] **Connection Pair Operations**:
  - Select Source ↔ Target connections for compare/migrate
  - Validate connection pairs
  - Handle connection pair context in all operations
- [ ] Test connection functionality for all stored connections
- [ ] Error handling for database operations
- [ ] Implement andb-core export commands (tables, functions, procedures, triggers)
- [ ] Implement andb-core compare functionality between connection pairs
- [ ] Implement andb-core migration tools between connection pairs

## ⚡ Phase 4: Main Features Implementation
- [ ] **Export Dashboard (Dual-Pane)**: 
  - Left pane: Visual representation of database objects using andb-core export
  - Right pane: SQL preview with syntax highlighting
  - Filter/search functionality
  - Export actions (tables, functions, procedures, triggers)
  - Display export results and file locations
  - Resizable panes with drag handle
- [ ] **Compare Interface (Dual-Pane)**: 
  - Left pane: Source database objects
  - Right pane: Destination database objects
  - Visual diff giữa environments using andb-core compare
  - Highlight differences with status indicators (✅ ⚠️ ❌)
  - Export comparison results
  - Side-by-side comparison view
  - Resizable panes with drag handle
- [ ] **Migration Manager (Dual-Pane)**: 
  - Left pane: Pending changes list
  - Right pane: Migration history
  - Create new migrations using andb-core migrate:new
  - Run/rollback migrations
  - Migration status tracking
  - Resizable panes with drag handle
- [ ] **Script Generator UI**: 
  - Form-based script generation using andb-core script generator
  - Preview generated scripts
  - Save/load script templates
  - Custom environment configuration

## 🚀 Phase 5: Advanced Features
- [ ] **Enhanced Visual Diff**: 
  - Syntax highlighting for SQL differences
  - Inline diff markers
  - Collapsible sections
  - Diff statistics summary
- [ ] **History Tracking**: Log changes và timestamps
- [ ] **Settings Panel**: App configuration
- [ ] **Export/Import**: Backup/restore settings
- [ ] **Keyboard Shortcuts**: 
  - Ctrl+B: Toggle sidebar
  - Ctrl+Left/Right: Resize panes
  - Ctrl+Shift+C: Compare selected
  - Ctrl+Shift+E: Export selected
  - Ctrl+Shift+M: Create migration
- [ ] **Auto-updater**: Keep app updated
- [ ] **Pane Layout Persistence**: Remember user's pane sizes and positions

## 🎯 Phase 6: Polish & Deploy
- [ ] Error handling & user feedback improvements
- [ ] Performance optimization
- [ ] Build & package cho Windows/Mac/Linux
- [ ] Auto-updater configuration
- [ ] Documentation (README, user guide)
- [ ] Testing & bug fixes

## 📝 Notes
- **Priority**: Focus on UI/UX design first (Phase 2)
- **Tech Stack**: Electron + Vue.js + TypeScript
- **UI Framework**: Consider Tailwind CSS hoặc Vuetify
- **Icons**: Lucide icons hoặc Feather icons
- **State Management**: Pinia (Vue 3) hoặc Vuex
- **Backend Integration**: `andb-core` npm package for all database operations
- **CLI Wrapper**: Create wrapper functions to interface with andb-core commands
- **Layout Features**: Auto-hide sidebar + Resizable dual-pane content
- **Responsive Design**: Desktop (dual-pane) → Tablet (single-pane) → Mobile (stacked)

## 🎨 UI Design Principles
- Clean, modern interface
- Intuitive navigation
- Clear visual hierarchy
- Responsive design
- Consistent color scheme
- Professional appearance
- **Dual-pane layout** for efficient comparison and preview
- **Auto-hide sidebar** to maximize workspace
- **Resizable panes** for flexible content viewing
- **Visual feedback** with status indicators and hover effects

---
*Last updated: [Current Date]*
