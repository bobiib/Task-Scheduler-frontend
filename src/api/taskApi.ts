import { apiClient } from './client'
import type { Task, CreateTaskPayload, TaskReminder } from '../types/task'

export const taskApi = {
    getTasks(params?: Record<string, string>): Promise<Task[]> {
        const query = params ? `?${new URLSearchParams(params)}` : ''
        return apiClient.get<Task[]>(`/tasks${query}`)
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

    getTaskReminders(taskId: number): Promise<TaskReminder[]> {
        return apiClient.get<TaskReminder[]>(`/tasks/${taskId}/reminders`)
    },

    updateInstanceStatus(instanceId: number, completed: boolean): Promise<{ instanceId: number; completed: boolean }> {
        return apiClient.patch<{ instanceId: number; completed: boolean }>(`/task-instances/${instanceId}/status`, {
            completed
        })
    }
}