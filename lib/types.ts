export type Role = 'admin' | 'kaleigh' | 'grecia' | 'meghan'

export interface Profile {
  id: string
  email: string
  name: string
  role: Role
}

export interface UserTask {
  id: string
  assigned_to: string
  assigned_by: string
  title: string
  date?: string
  type: string
  priority: number
  done: boolean
  project?: string
  private: boolean
  created_at: string
}

export interface Project {
  id: string
  title: string
  genre: string
  format: string
  logline: string
  targetAudience: string
  budget: number
  spent: number
  shootStart: string
  shootWrap: string
  currentStage: string
  salesAgent: string
  distributor: string
  attachments: string[]
  festivals: { name: string; status: string }[]
  links: { name: string; url: string }[]
  notes: string
}

export interface Goal {
  id: number
  objective: string
  progress: number
  target: string
  category: string
}

export interface FinanceEntry {
  id: number
  label: string
  amount: number
  date: string
  category: string
  project: string
}
