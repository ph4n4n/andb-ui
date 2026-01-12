// src/utils/miller-stack-helper.ts
import { ColumnNode, type MillerNode } from './types'

export class MillerStackHelper {
  /**
   * Calculate all action flags for UI buttons based on column relationships
   */
  static computeFlags(
    node: ColumnNode,
    prevNode: ColumnNode | null,
    nextNode: ColumnNode | null,
    allVisible: ColumnNode[]
  ): void {
    node.isStacked = node.stackedValue.length > 0;

    // 1. isStackable: Can THIS node be pushed INTO prev?
    node.isStackable = !node.isAcquired && prevNode !== null && !prevNode.isAcquired;

    // 2. isUnstackable: Can THIS node be popped OUT of parent?
    node.isUnstackable = node.isAcquired;

    // 3. canAcquireMore: Can THIS node pull in NEXT?
    node.canAcquireMore = !node.isAcquired && nextNode !== null && !nextNode.isAcquired;

    // 4. canReleaseChild: Can THIS node drop its last stacked child?
    node.canReleaseChild = node.isStacked;

    // 5. canAcquireAll: Are there multiple following columns available?
    const idx = allVisible.indexOf(node);
    const following = allVisible.slice(idx + 1);
    node.canAcquireAll = !node.isAcquired && following.length > 0;

    // 6. canReleaseAll: Has deep or multiple nested children?
    node.canReleaseAll = node.isStacked || this.hasDeepChildren(node);
  }

  private static hasDeepChildren(node: ColumnNode): boolean {
    return node.stackedValue.some(child =>
      child.node.isStacked || child.additionLevel > 1
    );
  }

  /**
   * Recursive search for the deepest selected node item in a column's tree
   */
  static findDeepestSelection(node: ColumnNode): MillerNode | null {
    const findSelected = (items: MillerNode[]): MillerNode | null => {
      const selected = items.find(i => i.id === node.selectedId || i.selected);
      if (!selected) return null;

      if (selected.children && selected.children.length > 0) {
        const deeper = selected.children.find(c => c.selected);
        if (deeper) {
          // This is simplified; in a real recursive tree you'd loop
          let current = deeper;
          while (current.children && current.children.find(c => c.selected)) {
            current = current.children.find(c => c.selected)!;
          }
          return current;
        }
      }
      return selected;
    }
    return findSelected(node.items);
  }

  static stackIntoPrevious(parent: ColumnNode, child: ColumnNode): void {
    const selItem = this.findDeepestSelection(parent);
    if (!selItem) return;

    const maxLevel = parent.stackedValue.length > 0
      ? Math.max(...parent.stackedValue.map(c => c.additionLevel))
      : 0;

    parent.stackedValue.push({
      node: child,
      additionLevel: maxLevel + 1
    });

    child.isAcquired = true;
    parent.isStacked = true;

    // Physical Link
    selItem.children = [...child.items];
    selItem.expanded = true;
    selItem.stackedColumnLevel = child.level;
  }

  static unstackLast(parent: ColumnNode): ColumnNode | null {
    const childWrapper = parent.stackedValue.pop();
    if (!childWrapper) return null;

    const child = childWrapper.node;
    child.isAcquired = false;

    if (parent.stackedValue.length === 0) {
      parent.isStacked = false;
    }

    // Clear physical links in the tree
    const clearLinks = (items: MillerNode[]) => {
      for (const it of items) {
        if (it.stackedColumnLevel === child.level) {
          it.children = [];
          it.expanded = false;
          delete it.stackedColumnLevel;
          return true;
        }
        if (it.children && clearLinks(it.children)) return true;
      }
      return false;
    }
    clearLinks(parent.items);

    return child;
  }

  static unstackAll(parent: ColumnNode): ColumnNode[] {
    const released: ColumnNode[] = [];
    while (parent.stackedValue.length > 0) {
      const releasedChild = this.unstackLast(parent);
      if (releasedChild) {
        if (releasedChild.isStacked) {
          released.push(...this.unstackAll(releasedChild));
        }
        released.push(releasedChild);
      }
    }
    return released;
  }
}
