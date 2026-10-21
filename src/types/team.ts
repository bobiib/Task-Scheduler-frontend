export type TeamRole = 'admin' | 'member'

export interface User {
  id: number
  name: string
  email: string
  initials: string
  color?: string
}

export interface TeamMember {
  userId: number
  name: string
  email: string
  initials: string
  role: TeamRole
}

export interface Team {
  id: number
  name: string
  initials: string
  color: string
  createdByUserId: number
  members: TeamMember[]
}
