// src/stores/millerColumns.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ColumnNode, type MillerNode } from './types'
import { MillerStackHelper } from './helper'

export const useMillerStore = defineStore('millerColumns', () => {
  const columns = ref<ColumnNode[]>([]);
  const isNavigating = ref(false);
  const autoCollapseEnabled = ref(false);

  const visibleColumns = computed(() =>
    columns.value.filter(c => !c.isAcquired)
  );

  const applyAutoCollapse = (activeLevel: number) => {
    if (!autoCollapseEnabled.value) return;

    // Logic: All columns before the current active one that are NOT pinned should collapse
    columns.value.forEach(col => {
      if (col.level < activeLevel && !col.isPinned) {
        col.isCollapsed = true;
      } else if (col.level >= activeLevel) {
        // Ensure active and future columns are NOT collapsed
        col.isCollapsed = false;
      }
    });
  };

  const setAutoCollapse = (enabled: boolean) => {
    autoCollapseEnabled.value = enabled;
    if (enabled) {
      const visible = visibleColumns.value;
      if (visible.length > 0) {
        applyAutoCollapse(visible[visible.length - 1].level);
      }
    } else {
      columns.value.forEach(c => c.isCollapsed = false);
    }
  };

  /**
   * Navigate to a node at a specific level
   */
  async function selectNode(
    node: MillerNode,
    level: number,
    fetcher?: (node: MillerNode) => Promise<MillerNode[]>,
    options: { skipFetch?: boolean } = {}
  ) {
    const currentCol = columns.value[level];
    if (!currentCol) return;

    const isSameNode = currentCol.selectedId === node.id;

    // 1. Truncate forward chain if selection changed
    if (!isSameNode && columns.value.length > level + 1) {
      // Before slicing, unstack everything forward to clean up physical links
      for (let i = columns.value.length - 1; i > level; i--) {
        const colToRemove = columns.value[i];
        if (colToRemove.isAcquired) {
          const owner = columns.value.find(p => p.stackedValue.some(sv => sv.node.id === colToRemove.id));
          if (owner) MillerStackHelper.unstackLast(owner);
        }
      }
      columns.value = columns.value.slice(0, level + 1);
    }

    // 2. Update selection
    if (!isSameNode && currentCol.isStacked) {
      MillerStackHelper.unstackAll(currentCol);
    }

    currentCol.selectedId = node.id;

    // Find the physical root of the stack this column belongs to
    let rootCol = currentCol;
    let owner = columns.value.find(p => p.stackedValue.some(sv => sv.node.id === rootCol.id));
    while (owner) {
      rootCol = owner;
      owner = columns.value.find(p => p.stackedValue.some(sv => sv.node.id === rootCol.id));
    }

    // Mark selection in tree items globally for this stack
    const markSelected = (items: MillerNode[]) => {
      items.forEach(it => {
        // If it's the node being selected
        if (it.id === node.id) {
          it.selected = true
        } else {
          // Deselect siblings ONLY IF they are at the same logical level
          // This is tricky in a recursive tree. Simple approach for now:
          // If the node we are selecting is at level 'L', any other node 
          // that would be at the same logical level in this stack should be deselected.
          // For now, let's just match the ID exactly.
          it.selected = false
        }
        if (it.children) markSelected(it.children);
      });
    };
    markSelected(rootCol.items);

    // If same node and already has content, JUST return (prevents flicker/re-fetch)
    // BUT we must check if the NEXT level is actually loaded
    if (isSameNode && columns.value.length > level + 1) {
      const nextCol = columns.value[level + 1];
      // If the next column exists AND its title matches this node, it's definitively the right branch
      if (nextCol && nextCol.title === node.name) {
        applyAutoCollapse(level);
        refreshFlags();
        return;
      }
    }

    if (options.skipFetch || !fetcher) {
      applyAutoCollapse(level);
      refreshFlags();
      return;
    }

    // 3. Fetch Next Column
    isNavigating.value = true;
    currentCol.isLoading = true;
    try {
      const nextNodes = await fetcher(node);
      if (nextNodes && nextNodes.length > 0) {
        const nextCol = new ColumnNode({
          level: level + 1,
          items: nextNodes,
          title: node.name
        });

        // 4. Stacking Logic
        if (currentCol.isAcquired || (visibleColumns.value.length === 1 && !nextCol.isFinalContent)) {
          MillerStackHelper.stackIntoPrevious(currentCol, nextCol);
        }

        columns.value.push(nextCol);
        applyAutoCollapse(level + 1);
      }
    } finally {
      isNavigating.value = false;
      currentCol.isLoading = false;
      refreshFlags();
    }
  }

  const refreshFlags = () => {
    const visible = visibleColumns.value;
    visible.forEach((col, idx) => {
      const prev = visible[idx - 1] || null;
      const next = visible[idx + 1] || null;
      MillerStackHelper.computeFlags(col, prev, next, visible);
    });
  };

  const stackToLevel = (level: number) => {
    const idx = columns.value.findIndex(c => c.level === level);
    if (idx <= 0) return;
    MillerStackHelper.stackIntoPrevious(columns.value[idx - 1], columns.value[idx]);
    refreshFlags();
  };

  const unstackLevel = (level: number) => {
    const col = columns.value.find(c => c.level === level);
    if (!col) return;
    if (col.isAcquired) {
      const owner = columns.value.find(p => p.stackedValue.some(sv => sv.node.id === col.id));
      if (owner) MillerStackHelper.unstackLast(owner);
    } else {
      MillerStackHelper.unstackLast(col);
    }
    refreshFlags();
  };

  const jumpToLevel = (level: number) => {
    if (columns.value.length > level + 1) {
      columns.value = columns.value.slice(0, level + 1);
      applyAutoCollapse(level);
      refreshFlags();
    }
  };

  const stackAll = (level: number) => {
    const visible = visibleColumns.value;
    const idx = visible.findIndex(c => c.level === level);
    if (idx === -1) return;

    const following = visible.slice(idx + 1);
    let currentParent = visible[idx];

    for (const child of following) {
      MillerStackHelper.stackIntoPrevious(currentParent, child);
      currentParent = child; // Chain them
    }
    refreshFlags();
  };

  const unstackAll = (level: number) => {
    const col = columns.value.find(c => c.level === level);
    if (!col) return;
    MillerStackHelper.unstackAll(col);
    columns.value = [...columns.value]; // Force reactivity
    refreshFlags();
  };

  return {
    columns,
    visibleColumns,
    isNavigating,
    autoCollapseEnabled,
    setAutoCollapse,
    selectNode,
    stackToLevel,
    unstackLevel,
    stackAll,
    unstackAll,
    jumpToLevel,
    refreshFlags
  };
});
