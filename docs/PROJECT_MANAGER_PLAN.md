# Project Manager Implementation Plan

## 🎯 Target

Build a unified **Project Manager** that serves as the central hub for the application, replacing the standalone Schema view. It features a macOS Finder-style interface with 4 view modes to manage projects, connections, pairs, and explore database schemas deeply.

---

## 🏗️ Architecture & Views

### 1. View Modes Overview

The user can switch between these modes instantly.

- **Grid View (Done)**: High-level overview with stats cards.
- **List View**: Compact table for management (sorting, bulk actions).
- **Columns View (Miller Columns)**: Deep navigation (Project → Schema/Conn → Env → DDL).
- **Detail View**: Master-detail layout (Tree on left, Code/Properties on right).

### 2. Schema Integration Strategy

Instead of a separate `/schema` page, schema exploration happens **inside** the Project Manager.

- **Components to Extract/Reuse**: `DDLCodeViewer`, `TreeView`, `DDLObjectList` from the current Schema view.
- **Router Change**: Deprecate `/schema` or redirect it to `/projects?view=detail`.

---

## 📋 Implementation Tasks

### Phase 1: Core Components & List View

**Goal**: Finish the foundation and basic management views.

- [x] Grid View & Basic Store Logic (Completed)
- [ ] **Fix `addProject` return type**: Ensure it returns the new object for selection.
- [ ] **List View Implementation**:
  - Table component with columns: Name, Description, Connections count, Pairs count.
  - Sort logic (asc/desc).
  - Inline editing support.

### Phase 2: Columns View (Finder Style)

- [x] **Step 1: Layout & State**
  - [x] Create `ColumnsView` container.
  - [x] Define `ColumnData` interface (level, items, selectedId).
  - [x] Add horizontal scroll layout.

- [x] **Step 2: Column Logic**
  - [x] Implement selection logic (truncate columns after selection).
  - [x] Implement data fetching for each level:
    - [x] Level 1: Projects (Already loaded).
    - [x] Level 2: Categories (Schema, Connections, Pairs).
    - [x] Level 3: Environments (derived from Project connections).
    - [x] Level 4: DDL Types (Tables, Views, etc.).
    - [x] Level 5: DDL Items (Lazy load from `sidebarStore` or API).

- [x] **Step 3: Preview Panel**
  - [x] Show `DDLCodeViewer` in the last column when an item is selected.
  - [x] Handle loading states.
- [x] **Schema Data Loading**: lazy-load schema based on selected Environment node.

### Phase 3: Detail View & Tree

**Goal**: A power-user view for simultaneous browsing and editing.

- [x] **TreeView Component**: Recursive component for hierarchical display (Implemented iteratively in `ProjectsDetailView`).
- [x] **Detail Layout**:
  - **Left**: Project Tree (Project root > Schema/Conns/Pairs > nested items).
  - **Center**: `DDLCodeViewer` (syntax highlighting, copy, export).
  - **Right**: Properties Panel (Live edit project settings - Existing functionality).

### Phase 4: Polish & Refactor

- [ ] **Extract Components**: Refactor code viewer and lists from `Schema.vue` into `src/components/shared`.
- [ ] **Route Updates**: Update main navigation to verify Project Manager is the entry point for Schema.
- [ ] **Keyboard Shortcuts**: Arrow keys navigation in Columns/Tree view.

---

## 🔧 Technical Details

### State Management (Pinia)

```typescript
interface ProjectViewStore {
  viewMode: 'list' | 'grid' | 'columns' | 'detail'
  selectedSelection: any[] // For multi-select
  //...
}
```

### Schema Loading Strategy

reuse `sidebarStore` logic but scoped to the **selected project's connections**.

```typescript
// Example: Get schemas only for connections in the active project
const projectConnections = appStore.connections.filter(c => project.connectionIds.includes(c.id))
const schemas = await Andb.getSchemas(projectConnections)
```

---

## 🔄 Dual View Strategy (Enforced)

To balance quick switching with deep management, the application adopts a strict **Two-Mode** approach. This strategy must be enforced across all views.

### Mode 1: Global Context (Header Driven)

_Purpose: Quick switching and global state filtering like a Master Switch._

- **Interaction**: User selects a project from the global Dropdown in the Header.
- **Behavior**:
  - The entire application state filters based on the `selectedProjectId`.
  - **Dashboard**: "Adaptive Dashboard" - morphs to show metrics _only_ for the selected project.
  - **Schema/Compare/History**: Lists and resources are strictly filtered to the active project context.
  - **Constraints**:
    - **Settings Page**: Maintains full Global Settings capability (100% current features).
    - This mode respects KISS by **reusing existing views** but just filtering the data.

### Mode 2: Project Explorer (Finder Style)

_Purpose: Focused work within a specific project boundary._

- **Context**: Triggered when a Project is active (not 'default').
- **Settings Handling (Strict KISS)**:
  - Global Connection/Pair management in Settings is **VISIBLE** (User Request) to avoid confusion.
  - Connection/Pair management happens **in-context** (e.g., via the Project's own "Properties" panel or "Add Connection" flow inside the Dashboard), NOT by reusing the global Settings page if it creates confusion or duplication.
  - _Correction_: If we follow KISS "absolute no duplicate", we should likely **redirect** management to the existing Global Settings page but pre-filtered, OR if the user wants separate isolated flows, we hide the global ones.
  - _User Decision_: "Project view mode -> connection/pair belongs to project -> setting hide them".
  - **Implementation**: When `selectedProjectId` is active, the Sidebar/Settings tabs for "Connections" and "Pairs" remain **VISIBLE** (User Request: "Don't hide them") to ensure accessibility.

### Adaptive Dashboard

The `Dashboard.vue` handles the "Landing":

1.  **Global State (`default`)**: Shows standard Global widgets.
2.  **Project State (`selected`)**: Shows Project Health & Project Resources.
    - **No new pages**. Just strict data filtering and widget swapping.

---

## 🚀 Execution Order

1.  **Refine Projects View (Done)**: Grid, List, Columns view implemented.
2.  **Enforce Global Context (The Filter)**:
    - [x] Update `Dashboard.vue` for Adaptive Data.
    - [x] Update Stores (`app.ts`, `connectionPairs.ts`) to provide filtered `computed` lists based on `projectsStore.selectedProjectId` (Implicitly done via store updates in previous turns).
    - [x] **Settings Visibility**: Connection/Pair tabs remain visible (Reverted strict hiding).
3.  **Detail View**: Implement Tree View.
    - [x] Tree Navigation and Schema Integration.
    - [x] DDL Viewer integration.

_Plan consolidated from previous discussions on 2026-01-06._
