import { apiClient } from './client'

export interface ApiLabel {
    id: number
    name: string
    color: string
    taskCount: number
}

export const labelApi = {
    getLabels(): Promise<ApiLabel[]> {
        return apiClient.get<ApiLabel[]>('/labels')
    },

    createLabel(name: string, color: string): Promise<ApiLabel> {
        return apiClient.post<ApiLabel>('/labels', { name, color })
    },

    deleteLabel(id: number): Promise<void> {
        return apiClient.delete<void>(`/labels/${id}`)
    }
}
