import { type MillerNode } from './types'
import { Folder, Database, Table, FileText, Zap } from 'lucide-vue-next'

export const sampleTreeData: MillerNode[] = [
  {
    id: 'sample-root',
    name: 'Miller Sample Library',
    type: 'root',
    icon: Folder,
    rawData: {},
    isTerminal: false,
    children: [
      {
        id: 'category-ui',
        name: 'UI Components',
        type: 'category',
        icon: Zap,
        rawData: {},
        isTerminal: false,
        children: [
          {
            id: 'comp-miller',
            name: 'Miller Columns',
            type: 'component',
            icon: Table,
            rawData: { description: 'The main component' },
            isTerminal: true
          },
          {
            id: 'comp-tree',
            name: 'Tree View',
            type: 'component',
            icon: Database,
            rawData: { description: 'Recursive tree renderer' },
            isTerminal: true
          }
        ]
      },
      {
        id: 'category-docs',
        name: 'Documentation',
        type: 'category',
        icon: FileText,
        rawData: {},
        isTerminal: false,
        children: [
          {
            id: 'doc-readme',
            name: 'README.md',
            type: 'file',
            icon: FileText,
            rawData: { content: '# Miller Column\nThis is a sample.' },
            isTerminal: true
          }
        ]
      }
    ]
  }
]

export const sampleFetcher = async (node: MillerNode): Promise<MillerNode[]> => {
  // Simple recursive mock fetcher
  console.log('Fetching for:', node.name)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(node.children || [])
    }, 400)
  })
}
