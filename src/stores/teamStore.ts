import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, Team, TeamMember, TeamRole } from '../types/team'

export const useTeamStore = defineStore('team', () => {
  const users = ref<User[]>([
    { id: 'u1', name: 'Boris', email: 'boris@task-scheduler.ch', initials: 'BO', color: '#5243E0' },
    { id: 'u2', name: 'Liam Bruno', email: 'liam@task-scheduler.ch', initials: 'LB', color: '#0284C7' },
    { id: 'u3', name: 'Dmytro Yermakov', email: 'dmytro@task-scheduler.ch', initials: 'DY', color: '#9333EA' },
    { id: 'u4', name: 'Fabio', email: 'fabio@task-scheduler.ch', initials: 'FA', color: '#EA580C' }
  ])

  const teams = ref<Team[]>([
    {
      id: 't1',
      name: 'Frontend-Entwicklung',
      initials: 'FE',
      color: '#5243E0',
      createdByUserId: 'u1',
      members: [
        { userId: 'u1', name: 'Boris', email: 'boris@task-scheduler.ch', initials: 'BO', role: 'admin' },
        { userId: 'u3', name: 'Dmytro Yermakov', email: 'dmytro@task-scheduler.ch', initials: 'DY', role: 'member' }
      ]
    },
    {
      id: 't2',
      name: 'Backend & DB',
      initials: 'BE',
      color: '#0284C7',
      createdByUserId: 'u2',
      members: [
        { userId: 'u2', name: 'Liam Bruno', email: 'liam@task-scheduler.ch', initials: 'LB', role: 'admin' },
        { userId: 'u4', name: 'Fabio', email: 'fabio@task-scheduler.ch', initials: 'FA', role: 'member' }
      ]
    },
    {
      id: 't3',
      name: 'Projektleitung',
      initials: 'PL',
      color: '#D97706',
      createdByUserId: 'u1',
      members: [
        { userId: 'u1', name: 'Boris', email: 'boris@task-scheduler.ch', initials: 'BO', role: 'admin' },
        { userId: 'u2', name: 'Liam Bruno', email: 'liam@task-scheduler.ch', initials: 'LB', role: 'admin' }
      ]
    }
  ])

  function getTeamById(teamId: string): Team | undefined {
    return teams.value.find(t => t.id === teamId)
  }

  function getUserById(userId: string): User | undefined {
    return users.value.find(u => u.id === userId)
  }

  function getAdminCount(team: Team): number {
    return team.members.filter(m => m.role === 'admin').length
  }

  function canDemoteAdmin(teamId: string, userId: string): boolean {
    const team = getTeamById(teamId)
    if (!team) return false
    const member = team.members.find(m => m.userId === userId)
    if (!member || member.role !== 'admin') return true
    return getAdminCount(team) > 1
  }

  function canRemoveMember(teamId: string, userId: string): boolean {
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

  function createTeam(name: string, creatorUserId: string): boolean {
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

    const newTeam: Team = {
      id: 't' + Date.now().toString(),
      name: trimmed,
      initials,
      color: '#5243E0',
      createdByUserId: creator.id,
      members: [
        {
          userId: creator.id,
          name: creator.name,
          email: creator.email,
          initials: creator.initials,
          role: 'admin'
        }
      ]
    }

    teams.value.push(newTeam)
    return true
  }

  function addMember(teamId: string, userId: string, role: TeamRole = 'member'): boolean {
    const team = getTeamById(teamId)
    const user = getUserById(userId)
    if (!team || !user) return false
    if (team.members.some(m => m.userId === userId)) return false

    team.members.push({
      userId: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      role
    })
    return true
  }

  function removeMember(teamId: string, userId: string): boolean {
    if (!canRemoveMember(teamId, userId)) return false
    const team = getTeamById(teamId)
    if (!team) return false

    team.members = team.members.filter(m => m.userId !== userId)
    return true
  }

  function toggleRole(teamId: string, userId: string): boolean {
    const team = getTeamById(teamId)
    if (!team) return false
    const member = team.members.find(m => m.userId === userId)
    if (!member) return false

    if (member.role === 'admin') {
      if (!canDemoteAdmin(teamId, userId)) return false
      member.role = 'member'
    } else {
      member.role = 'admin'
    }
    return true
  }

  function deleteTeam(teamId: string): void {
    teams.value = teams.value.filter(t => t.id !== teamId)
  }

  function getUserTeams(userId: string): Team[] {
    return teams.value.filter(team => team.members.some(m => m.userId === userId))
  }

  function getAvailableUsersForTeam(teamId: string): User[] {
    const team = getTeamById(teamId)
    if (!team) return []
    const memberIds = new Set(team.members.map(m => m.userId))
    return users.value.filter(u => !memberIds.has(u.id))
  }

  return {
    users,
    teams,
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
