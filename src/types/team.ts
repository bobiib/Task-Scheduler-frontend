export type TeamRole = 'admin' | 'member'

export interface User {
  id: string
  name: string
  email: string
  initials: string
  color?: string
}

export interface TeamMember {
  userId: string
  name: string
  email: string
  initials: string
  role: TeamRole
}

export interface Team {
  id: string
  name: string
  initials: string
  color: string
  createdByUserId: string
  members: TeamMember[]
}
