# Project Focus Mode: Master Implementation Plan

This document defines the unified strategy for the **Focus Project View** (Miller Columns), integrating existing features into the new navigation hierarchy.

## 1. Core Principle: Zero Impact on Normal Mode (Super Legacy)

**Normal View (Compare.vue, etc.) is considered an immutable legacy system.**

- **DO NOT** modify shared components or logic in a way that breaks Normal Mode.
- All Focus Mode enhancements must be **additive** (optional props) or **isolated** (separate composables/wrappers).
- Focus Mode is built using the **"Reuse, Do Not Duplicate"** approach—wrapping existing components rather than cloning them.

---

## 2. Navigation Taxonomy (Node Classification)

The Miller Column system distinguishes between **Branch Nodes** (Exploration) and **Leaf Nodes** (Execution/Work). Some nodes are **Hybrid** (Exploration + Preview).

### A. Branch Nodes (The Navigation Skeleton)

_Purpose: Data exploration and context handover to the next column._

| Level  | Node Type             | Triggers Next Column         | Metadata Handover (`rawData`)     | Primary Intent       |
| :----- | :-------------------- | :--------------------------- | :-------------------------------- | :------------------- |
| **0**  | **Project Root**      | Categories (Level 1)         | `project: Project`                | Select Active Base   |
| **1**  | **Category (Pairs)**  | Sync Pairs List (Level 2a)   | `category: 'pairs'`               | Go to Sync Workflow  |
| **1**  | **Category (Schema)** | Environments List (Level 2)  | `category: 'schema'`              | Explore Architecture |
| **1**  | **Category (Config)** | Global Connection List       | `category: 'config'`              | Manage Credentials   |
| **2**  | **Environment**       | Databases (Level 3)          | `envName`, `projectId`            | Explore Instance     |
| **2a** | **Sync Pair**         | Changed Types (Level 3a)     | `pair: ConnectionPair`            | Compare & Sync       |
| **3**  | **Database (Hybrid)** | Object Types (Level 4)       | `connection: DatabaseConnection`  | ERD / Table Drill    |
| **3a** | **Pair Data Type**    | Pair Managed List (Level 4a) | `pair`, `type: 'tables'\|'views'` | Batch Diff Audit     |
| **4**  | **Object Type**       | Entity List (Level 5)        | `type`, `parentConn`              | Filtered Selection   |

### B. Leaf & Hybrid Nodes (The Workshop Terminal)

_Purpose: Actual work and content inspection in the **Preview Pane**._

| Node Type          | Reused Component             | Target Prop(s) / Context           | Primary Workflow Action       | Secondary Actions (Buttons) |
| :----------------- | :--------------------------- | :--------------------------------- | :---------------------------- | :-------------------------- |
| **Project Root**   | `ProjectsDetailView.vue`     | `project: Project`                 | **Dashboard** & Pulse Check   | Clone, Delete Base, Export  |
| **Environment**    | `EnvironmentManager.vue`     | `project`, `selectedEnv`           | **Environment Health**        | Clean Cache, Re-scan        |
| **Database**       | `SchemaDiagram.vue`          | `tables: Table[]`                  | **ERD Visualization**         | Zoom, Search, Auto-Layout   |
| **Sync Pair**      | `ConnectionPairManager.vue`  | `activePairId: string`             | **Pair Config & Rules**       | Test Sync, Set Default      |
| **Connection**     | `ConnectionForm.vue`         | `connectionId: string`             | **Credential Management**     | Test Connection, Copy Path  |
| **Object (DDL)**   | `DDLCodeViewer.vue`          | `code`, `language`, `name`         | **Atomic SQL Inspection**     | Copy SQL, Snapshot, History |
| **Pair Object**    | `MirrorDiffView.vue`         | `sourceDdl`, `targetDdl`, `status` | **Side-by-Side Comparison**   | **MIGRATE** (Terminal Flow) |
| **Backup/Snap**    | `BackupManager.vue`          | `path`, `projectId`                | **Historical Recovery**       | Restore, Open in Finder     |
| **Global Config**  | `Settings.vue` (Sub-section) | `activeTab: string`                | **App-wide Preferences**      | Reset Data, Theme toggle    |
| **Migration Flow** | `MigrationConfirm.vue`       | `items`, `sourceLabel`, `target`   | **Final Execution & SQL Log** | **CONFIRM SYNC**            |

---

## 3. Maturation Phases (Column-by-Column)

Implementation follows a maturation strategy for each Level and its associated Preview View.

### Phase 1: The Leaf Terminal (Level 5 & 3a) - [PRIORITY P0]

_Focus: Atomic inspection and direct comparison._

- [x] **Action 1 (Objects)**: Finalize **`DDLCodeViewer.vue`** integration (Real DDL fetching implemented).
- [x] **Action 2 (Diffs)**: Connect **`MirrorDiffView.vue`** to Sync Pair object nodes.
- [ ] **Action 3 (Migration)**: Bridge the "Migrate" call to **`MigrationConfirm.vue`** as a terminal preview state (Currently using Modal flow).

### Phase 2: The Database Terminal (Level 3) - [PRIORITY P0]

_Focus: Schema-wide visualization._

- [x] **Action 1 (ERD)**: Implement **`SchemaDiagram.vue`** for Database nodes (Requires schema/table fetching).
- [x] **Action 2 (Drill-down)**: Enable the Hybrid "Branch" behavior (Databases -> Object Types).

### Phase 3: The Project Root (Level 0) - [PRIORITY P1]

_Focus: High-level overview._

- [ ] **Action 1 (Dashboard)**: Implement **`ProjectsDetailView.vue`** for the project root.
- [x] **Action 2 (CRUD)**: Sync project-level actions (Add/Delete/Clone) from the Miller Column header/nodes.

### Phase 4: The Config Terminal (Level 1 & 2) - [PRIORITY P2]

- [ ] **Action 1 (Configuration)**: Port `EnvironmentManager.vue` and `ConnectionPairManager.vue`.
- [ ] **Action 2 (Credential CRUD)**: Port `ConnectionForm.vue` for individual connection leaf nodes.

---

## 4. Technical Integration Rules

1. **Context Injection**: Every reused component MUST receive its data via a common `context` prop or defined IDs. Do not rely on Global URL params.
2. **Full-Width Preview**: For heavy views (MirrorDiff, SchemaDiagram, Migration), the Preview Pane should expand to `flex-1`.
3. **No Modals Rule (Strict Enforcement)**: In Miller Column View, **NEVER** use modals for functional workflows. All operations MUST happen in the **Preview Pane**.
4. **Zero Impact on Normal Mode (Super Legacy)**: Normal View is immutable. Modifications must be additive/isolated.
5. **Event Orchestration**: `ProjectsColumnsView.vue` handles all cross-component refreshes (e.g., refreshing column N after an action in preview pane).

---

_Last Updated: 2026-01-12_
