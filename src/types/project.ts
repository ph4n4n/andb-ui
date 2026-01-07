export interface Project {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
  connectionIds: string[]
  pairIds: string[]
  enabledEnvironmentIds: string[]
  pinnedColumnTypes?: string[]
  createdAt: string
  updatedAt: string
}
