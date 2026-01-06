export interface Project {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
  connectionIds: string[]
  pairIds: string[]
  createdAt: string
  updatedAt: string
}
