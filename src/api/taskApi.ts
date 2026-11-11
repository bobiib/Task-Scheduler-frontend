import { apiClient } from './client'
import type { Task, CreateTaskPayload, ReminderUnit, TaskReminder } from '../types/task'

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

    createReminder(taskId: number, reminder: { amount: number; unit: ReminderUnit }): Promise<TaskReminder> {
        return apiClient.post<TaskReminder>(`/tasks/${taskId}/reminders`, reminder)
    },

    updateReminder(id: number, reminder: { amount: number; unit: ReminderUnit }): Promise<TaskReminder> {
        return apiClient.patch<TaskReminder>(`/reminders/${id}`, reminder)
    },

    deleteReminder(id: number): Promise<void> {
        return apiClient.delete<void>(`/reminders/${id}`)
    },

    updateInstanceStatus(instanceId: number, completed: boolean): Promise<{ instanceId: number; completed: boolean }> {
        return apiClient.patch<{ instanceId: number; completed: boolean }>(`/task-instances/${instanceId}/status`, {
            completed
        })
    }
}