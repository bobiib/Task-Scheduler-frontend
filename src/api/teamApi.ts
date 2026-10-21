import { apiClient } from './client'
import type { TeamRole } from '../types/team'

export interface ApiUser {
    id: number
    name: string
    email: string
    initials: string
}

export interface ApiTeam {
    id: number
    name: string
    initials: string
    createdByUserId: number
    members: { id: number; name: string; initials: string; role: TeamRole }[]
}

export interface TeamPayload {
    name?: string
    initials?: string
    createdByUserId?: number
    memberIds?: number[]
    adminIds?: number[]
}

export const teamApi = {
    getUsers(): Promise<ApiUser[]> {
        return apiClient.get<ApiUser[]>('/users')
    },

    getTeams(): Promise<ApiTeam[]> {
        return apiClient.get<ApiTeam[]>('/teams')
    },

    createTeam(payload: TeamPayload): Promise<ApiTeam> {
        return apiClient.post<ApiTeam>('/teams', payload)
    },

    updateTeam(id: number, payload: TeamPayload): Promise<ApiTeam> {
        return apiClient.patch<ApiTeam>(`/teams/${id}`, payload)
    },

    deleteTeam(id: number): Promise<void> {
        return apiClient.delete<void>(`/teams/${id}`)
    }
}
