import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useProjectNavigation } from '@/composables/useProjectNavigation'
import { useProjectsStore } from './projects'
import { Folder } from 'lucide-vue-next'
import { useMillerStore } from '@/packages/miller-column/store'
import { type MillerNode, ColumnNode } from '@/packages/miller-column/types'

export const useProjectNavigationStore = defineStore('projectNavigation', () => {
  const millerStore = useMillerStore()
  const projectsStore = useProjectsStore()
  const { loadNodeChildren } = useProjectNavigation()

  // --- ACTIONS ---

  const mapNode = (item: any, context: any = {}): MillerNode => ({
    ...item,
    rawData: { ...item, context },
    isTerminal: item.type === 'object' || item.type === 'pair' || item.type === 'connection' || item.isTerminal,
    children: item.children ? item.children.map((c: any) => mapNode(c, context)) : undefined
  })

  /**
   * The abstract fetcher that bridges domain data to Miller package
   */
  const millerFetcher = async (node: MillerNode): Promise<MillerNode[]> => {
    const contextType = node.type || 'projects'
    const result = await loadNodeChildren(node, contextType, node.rawData?.context || {})

    return (result?.items || []).map(item => mapNode(item, node.rawData?.context || {}))
  }

  const selectNode = async (item: MillerNode, level: number) => {
    await millerStore.selectNode(item, level, millerFetcher)
  }

  const loadRoot = async (projectId?: string) => {
    const rootItems: MillerNode[] = projectsStore.projects.map(p => ({
      id: p.id,
      name: p.name || 'Untitled Base',
      type: p.id === 'miller-sample-blueprint' ? 'root' : 'projects',
      icon: Folder,
      rawData: p.id === 'miller-sample-blueprint' ? { isSample: true } : p,
      isTerminal: false
    }))

    // Initialize the root column in the abstract store
    millerStore.columns = [
      new ColumnNode({
        id: 'root',
        level: 0,
        title: 'Active Bases',
        items: [...rootItems], // Spread to ensure new reference
        isPinned: true
      })
    ]

    // 2. Auto-Focus Logic: Deep expand "Schema" for the current project
    const targetId = projectId || rootItems[0]?.id
    if (targetId) {
      const pNode = rootItems.find(i => i.id === targetId)
      if (pNode) {
        // Step 1: Select Project
        if (pNode.type === 'projects') {
          projectsStore.selectProject(pNode.id)
        }
        await selectNode(pNode, 0)

        // Step 2: Auto-select "Schema" Category (Level 1)
        const categoriesCol = millerStore.columns[1]
        if (categoriesCol) {
          const schemaNode = categoriesCol.items.find(i => i.id === 'schema')
          if (schemaNode) {
            await selectNode(schemaNode, 1)
          }
        }
      }
    }
  }

  return {
    columns: computed(() => millerStore.columns),
    visibleColumns: computed(() => millerStore.visibleColumns),
    isNavigating: computed(() => millerStore.isNavigating),
    selectNode,
    loadRoot,
    millerFetcher,
    loadNodeChildren,
    // Delegate stack actions
    stackToLevel: millerStore.stackToLevel,
    unstackToLevel: millerStore.unstackLevel
  }
})
