import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, Team, TeamMember, TeamRole } from '../types/team'
import { teamApi, type ApiTeam } from '../api/teamApi'

export const useTeamStore = defineStore('team', () => {
  const users = ref<User[]>([])
  const teams = ref<Team[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function toTeam(team: ApiTeam): Team {
    return {
      id: team.id,
      name: team.name,
      initials: team.initials,
      color: '#5243E0',
      createdByUserId: team.createdByUserId,
      members: team.members.map(member => ({
        userId: member.id,
        name: member.name,
        email: getUserById(member.id)?.email ?? '',
        initials: member.initials,
        role: member.role
      }))
    }
  }

  function replaceTeam(team: ApiTeam) {
    teams.value = teams.value.map(t => (t.id === team.id ? toTeam(team) : t))
  }

  function setError(err: unknown, fallback: string) {
    error.value = err instanceof Error ? err.message : fallback
  }

  async function fetchTeams() {
    loading.value = true
    error.value = null
    try {
      users.value = await teamApi.getUsers()
      teams.value = (await teamApi.getTeams()).map(toTeam)
    } catch (err: unknown) {
      setError(err, 'Fehler beim Laden der Teams')
    } finally {
      loading.value = false
    }
  }

  async function saveMembers(teamId: number, members: TeamMember[]): Promise<boolean> {
    error.value = null
    try {
      const updated = await teamApi.updateTeam(teamId, {
        memberIds: members.map(m => m.userId),
        adminIds: members.filter(m => m.role === 'admin').map(m => m.userId)
      })
      replaceTeam(updated)
      return true
    } catch (err: unknown) {
      setError(err, 'Fehler beim Speichern des Teams')
      return false
    }
  }

  function getTeamById(teamId: number): Team | undefined {
    return teams.value.find(t => t.id === teamId)
  }

  function getUserById(userId: number): User | undefined {
    return users.value.find(u => u.id === userId)
  }

  function getAdminCount(team: Team): number {
    return team.members.filter(m => m.role === 'admin').length
  }

  function canDemoteAdmin(teamId: number, userId: number): boolean {
    const team = getTeamById(teamId)
    if (!team) return false
    const member = team.members.find(m => m.userId === userId)
    if (!member || member.role !== 'admin') return true
    return getAdminCount(team) > 1
  }

  function canRemoveMember(teamId: number, userId: number): boolean {
    const team = getTeamById(teamId)
    if (!team) return false
    if (team.members.length <= 1) return false
    const member = team.members.find(m => m.userId === userId)
    if (!member) return false
    if (member.role === 'admin' && getAdminCount(team) <= 1) {
      return false
    }
    return true
  }

  async function createTeam(name: string, creatorUserId: number): Promise<boolean> {
    const trimmed = name.trim()
    if (!trimmed) return false
    if (teams.value.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return false

    const creator = getUserById(creatorUserId)
    if (!creator) return false

    const initials = trimmed
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase() || 'TM'

    error.value = null
    try {
      const created = await teamApi.createTeam({
        name: trimmed,
        initials,
        createdByUserId: creator.id,
        memberIds: [creator.id],
        adminIds: [creator.id]
      })
      teams.value.push(toTeam(created))
      return true
    } catch (err: unknown) {
      setError(err, 'Fehler beim Erstellen des Teams')
      return false
    }
  }

  async function addMember(teamId: number, userId: number, role: TeamRole = 'member'): Promise<boolean> {
    const team = getTeamById(teamId)
    const user = getUserById(userId)
    if (!team || !user) return false
    if (team.members.some(m => m.userId === userId)) return false

    return saveMembers(teamId, [
      ...team.members,
      { userId: user.id, name: user.name, email: user.email, initials: user.initials, role }
    ])
  }

  async function removeMember(teamId: number, userId: number): Promise<boolean> {
    if (!canRemoveMember(teamId, userId)) return false
    const team = getTeamById(teamId)
    if (!team) return false

    return saveMembers(teamId, team.members.filter(m => m.userId !== userId))
  }

  async function toggleRole(teamId: number, userId: number): Promise<boolean> {
    const team = getTeamById(teamId)
    if (!team) return false
    const member = team.members.find(m => m.userId === userId)
    if (!member) return false
    if (member.role === 'admin' && !canDemoteAdmin(teamId, userId)) return false

    const newRole: TeamRole = member.role === 'admin' ? 'member' : 'admin'
    return saveMembers(teamId, team.members.map(m => (m.userId === userId ? { ...m, role: newRole } : m)))
  }

  async function deleteTeam(teamId: number): Promise<void> {
    error.value = null
    try {
      await teamApi.deleteTeam(teamId)
      teams.value = teams.value.filter(t => t.id !== teamId)
    } catch (err: unknown) {
      setError(err, 'Fehler beim Löschen des Teams')
    }
  }

  function getUserTeams(userId: number): Team[] {
    return teams.value.filter(team => team.members.some(m => m.userId === userId))
  }

  function getAvailableUsersForTeam(teamId: number): User[] {
    const team = getTeamById(teamId)
    if (!team) return []
    const memberIds = new Set(team.members.map(m => m.userId))
    return users.value.filter(u => !memberIds.has(u.id))
  }

  return {
    users,
    teams,
    loading,
    error,
    fetchTeams,
    getTeamById,
    getUserById,
    getAdminCount,
    canDemoteAdmin,
    canRemoveMember,
    createTeam,
    addMember,
    removeMember,
    toggleRole,
    deleteTeam,
    getUserTeams,
    getAvailableUsersForTeam
  }
})
