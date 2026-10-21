import { apiClient } from './client'
import type { Task, CreateTaskPayload } from '../types/task'

export const taskApi = {
    getTasks(): Promise<Task[]> {
        return apiClient.get<Task[]>('/tasks')
    },

    createTask(payload: CreateTaskPayload): Promise<Task> {
        return apiClient.post<Task>('/tasks', payload)
    },

    updateTask(id: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
        return apiClient.patch<Task>(`/tasks/${id}`, payload)
    },

    deleteTask(id: number): Promise<void> {
        return apiClient.delete<void>(`/tasks/${id}`)
    },

    updateInstanceStatus(instanceId: number, completed: boolean): Promise<{ instanceId: number; completed: boolean }> {
        return apiClient.patch<{ instanceId: number; completed: boolean }>(`/task-instances/${instanceId}/status`, {
            completed
        })
    }
}
