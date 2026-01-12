// src/types/miller-columns.ts

export interface MillerNode<T = any> {
  id: string;
  name: string;
  icon?: any;
  type: string;
  rawData: T;           // Generic container for domain-specific data
  children?: MillerNode<T>[];
  isTerminal?: boolean; // If true, renders terminal UI (e.g., Code Editor)
  selected?: boolean;
  expanded?: boolean;
  stackedColumnLevel?: number; // Bridge to a stacked column
}

export interface StackedChild<T = any> {
  node: ColumnNode<T>;
  additionLevel: number; // Level difference from owner column
}

export class ColumnNode<T = any> {
  id: string;
  level: number;
  title: string;
  items: MillerNode<T>[] = [];
  selectedId: string | null = null;

  // State
  isCollapsed: boolean = false;
  isStacked: boolean = false;   // Has children nested inside it (owner)
  isAcquired: boolean = false;  // Is nested inside a parent column (child)
  isPinned: boolean = false;
  isFinalContent: boolean = false;
  isLoading: boolean = false;

  // Stacking metadata
  stackedValue: StackedChild<T>[] = [];

  // Action Flags (computed by helper)
  isStackable: boolean = false;
  isUnstackable: boolean = false;
  canAcquireMore: boolean = false;
  canReleaseChild: boolean = false;
  canAcquireAll: boolean = false;
  canReleaseAll: boolean = false;

  constructor(data: Partial<ColumnNode<T>>) {
    this.id = data.id || `col-${Date.now()}`;
    this.level = data.level || 0;
    this.title = data.title || 'Untitled';
    this.items = data.items || [];
    this.selectedId = data.selectedId || null;
    this.isCollapsed = data.isCollapsed || false;
    this.isPinned = data.isPinned || false;
    this.isFinalContent = data.isFinalContent || false;

    if (data.isStacked !== undefined) this.isStacked = data.isStacked;
    if (data.isAcquired !== undefined) this.isAcquired = data.isAcquired;
    if (data.stackedValue) this.stackedValue = data.stackedValue;
  }
}
