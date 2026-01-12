# Abstract Miller Columns: The Skeleton Spec

This directory contains a reusable, domain-agnostic Miller Columns system designed for Vue.js. It prioritizes **UI hardware acceleration**, **strict axial alignment**, and **recursive inheritance**.

## 1. Architectural Blueprint (TH/TD)

Every column is cast from this single blueprint, maintaining structural DNA while allowing feature injection.

### TH (The Control Anchor - Header)

- **Expanded**: Displays Navigation Controls (Pin, Stack into Parent, Universal Stack).
- **Collapsed**: Simple Dot (4x4px circle) as the head anchor point.

### TD (The Identity Rail - Body)

- **Collapsed (Focus Mode)**: Adheres to the **"Topmost Absolute Rule"**.
  - **Active Icon**: Naked identity icon at the top.
  - **Vertical Text**: Title text rotated 180°, top-aligned, starting 8px below the icon.
- **Perfect Axis**: Dot (TH), Icon (TD), and Text (TD) are strictly aligned on a single vertical axis.

## 2. The Chain Engine (Strict Lineage)

The system treats columns as a **Linked List** chain.

- **Recursive Acquisition**: When Column [N+1] is stacked into Column [N], the physical items of [N+1] are injected into the `children` array of the selected node in [N].
- **Sequential Context**: Column `[N]` only receives context from Column `[N-1]`.
- **Cascading Collapse**: Stacking a parent column `[N]` automatically collapses all children `[N+1...M]`.

## 3. Data Abstraction

The package is **Headless**. It does not know about domain specifics (databases, projects, etc.). It communicates via normalized types:

- **MillerNode**: The data item (id, name, icon, type, children, isTerminal).
- **ColumnNode**: The column container (level, title, items, selectedId, isCollapsed).

## 4. Test Scenarios (Vitest)

Implementations must pass:

1. **Sequential Stack**: 0 -> 1 -> 2 correctly nests items.
2. **Deep Unstack**: Clearing roots restores independent columns.
3. **Axial Alignment**: Dot, Icon, and Text must align within 0.1px.

---

_Status: Production Ready Specification_
