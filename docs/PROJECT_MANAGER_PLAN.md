# Project Manager Implementation Plan

## 🎯 Target

Build a unified **Project Manager** that serves as the central hub for the application. It features a macOS Finder-style **Columns View (Miller Columns)** interface to manage projects, connections, pairs, and explore database schemas deeply.

---

## 🏗️ Architecture & Views

### 1. View Strategy (Columns-Only)

**Single View Policy**: To reduce complexity and clutter, the Project Manager strictly uses the **Columns View**.

- **Columns View**: Deep navigation (Project → Schema/Conn → Env → DDL).
- _Deprecated/Removed_: Grid, List, and Detail views have been removed per user request to streamline the experience.

### 2. Schema Integration Strategy

Instead of a separate `/schema` page, schema exploration happens **inside** the Project Manager.

- **Components to Extract/Reuse**: `DDLCodeViewer`, `TreeView` (from Compare).
- **Router Integration**: Project Manager is the entry point for Schema exploration.

---

## 📋 Implementation Tasks

### Phase 1: Core Components

- [x] Basic Store Logic (Completed)
- [ ] **Fix `addProject` return type**: Ensure it returns the new object for selection.
- [ ] **Clean up View Modes**: Remove unused Grid/List code from stores and components.

### Phase 2: Columns View (Finder Style) - Core Experience

- [x] **Step 1: Layout & State**
  - [x] Create `ColumnsView` container.
  - [x] Define `ColumnData` interface (level, items, selectedId).
  - [x] Add horizontal scroll layout with resize capabilities.

- [x] **Step 2: Column Logic & Hierarchy**
  - [x] **Hierarchy**: Project → Categories (Schema, Connections, Pairs) -> Environments -> DDL Types -> DDL Items.
  - [x] **Columns Behavior**:
    - [x] Truncate columns after selection.
    - [x] **Project Focus Mode**: First column (Project List) collapses when a project is selected.
    - [x] **Rotated Header**: Collapsed columns show vertical text (270 deg) for space efficiency.
    - [x] **Inline Editing**: Edit project/column names directly in the header.

- [x] **Step 3: Preview Panels**
  - [x] **DDL Viewer**: Maximized space usage for code viewing.
  - [x] **Sync Pair Preview**: Added separate preview template for Sync Pairs.
    - [x] Summary of Source -> Target.
    - [x] **"Diff / Mirror" Action**: Navigation to `/compare?pairId=...` for full diff workbench.
  - [ ] **Connection Preview**: (Pending) Show connection details and status (User Request).

- [x] **Step 4: UI/UX Refinement**
  - [x] **Breadcrumbs**: Replaced static header title with dynamic breadcrumbs based on column selection.
  - [x] **Removed Properties Panel**: Simplified UI by moving editing to headers.
  - [x] **Visual Polish**: Styling updates for dark mode, glassmorphism impacts.

### Phase 3: Detail View & Tree

- [x] **TreeView Component**: Recursive component for hierarchical display (Implemented iterative in `ProjectsDetailView` - now deprecated).
- [ ] **Detail Layout**:
  - **Status**: `ProjectsDetailView.vue` was removed in favor of the enhanced `ColumnsView`.

### Phase 4: Polish & Refactor

- [ ] **Extract Components**: Refactor code viewer and lists from `Schema.vue` into `src/components/shared`.
- [ ] **Route Updates**: Update main navigation to verify Project Manager is the entry point for Schema.
- [ ] **Keyboard Shortcuts**: Arrow keys navigation in Columns/Tree view.

---

## 🔧 User Feedback & Resolution Log

### Resolved

- **"vs mấy cái collaped, cho cái tên vừa active thành header rotate 90 độ hiện ra đi"**: Implemented vertical text header for collapsed columns.
- **"khi click vào Untitle Base phải editable"**: Implemented inline editing in column headers.
- **"pane này giờ vơ nghĩa (Properties Panel)"**: Removed Properties Panel from `Projects.vue`.
- **"code view nên giãn tối đa khoản trống cho phép"**: Optimized `DDLCodeViewer` layout in `ProjectsColumnsView`.
- **"Chưa thấy Mirror DIF view"**: Added Sync Pair preview with "Diff / Mirror" call-to-action.
- **"bug grayout khi vào Diff view"**: Fixed `pairId` parameter passing to `Compare.vue`.
- **"sorry mày, 90 độ có vẻ sai, là 270 độ"**: Corrected rotation to `vertical-rl`.
- **"Breadcrumbs support"**: Added breadcrumbs path in header (e.g., `Base One > Schema > ...`).
- **"giữ Columns view thôi"**: Removed Grid/List/Detail views from plan.

### Outstanding / To-Do

- **"PM focus chưa xem được thông tin connection"**: Need to implement Connection Preview template in `ColumnsView`.
- **"chưa xem được list ENV"**: Environment list is technically visible in "Schema" path, but direct "Environments" column under Project might be unclear if hidden under Schema. (Need clarification if user wants top-level Env list).
- **Clean up Code**: Remove unused `ProjectsGrid.vue`, `ProjectsList.vue` if they exist, and store viewMode logic.

---

## 🔧 Technical Details

### State Management (Pinia)

```typescript
interface ProjectViewStore {
  // viewMode removed - defaulting to Columns View
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

### Mode 2: Project Explorer (Focus Mode)

_Purpose: Focused work within a specific project boundary._

- **Context**: Triggered when a Project is active (not 'default').
- **Implementation**:
  - **ProjectsColumnsView** becomes the primary interface.
  - Sidebar is hidden (in strict Focus Mode) to maximize space.
  - Columns collapse to provide context while focusing on deep content.

### Adaptive Dashboard

The `Dashboard.vue` handles the "Landing":

1.  **Global State (`default`)**: Shows standard Global widgets.
2.  **Project State (`selected`)**: Shows Project Health & Project Resources.
    - **No new pages**. Just strict data filtering and widget swapping.

_Last Updated: 2026-01-07_
