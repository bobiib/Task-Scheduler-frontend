import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, CreateTaskPayload } from '../types/task'
import { taskApi } from '../api/taskApi'

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref<Task[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const openTasks = computed(() => tasks.value.filter(t => !t.completed))
    const completedTasks = computed(() => tasks.value.filter(t => t.completed))

    async function fetchTasks() {
        loading.value = true
        error.value = null
        try {
            const data = await taskApi.getTasks()
            tasks.value = data
        } catch (err: unknown) {
            if (err instanceof Error) {
                error.value = err.message
            } else {
                error.value = 'Fehler beim Laden der Tasks'
            }
        } finally {
            loading.value = false
        }
    }

    async function toggleTask(instanceId: number) {
        const task = tasks.value.find(t => t.instanceId === instanceId)
        if (!task) return

        const previousState = task.completed
        task.completed = !previousState

        try {
            await taskApi.updateInstanceStatus(instanceId, task.completed)
        } catch (err: unknown) {
            task.completed = previousState
            if (err instanceof Error) {
                error.value = err.message
            }
        }
    }

    async function addTask(payload: CreateTaskPayload) {
        loading.value = true
        error.value = null
        try {
            const created = await taskApi.createTask(payload)
            tasks.value.unshift(created)
            return created
        } catch (err: unknown) {
            if (err instanceof Error) {
                error.value = err.message
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateTask(id: number, payload: Partial<CreateTaskPayload>) {
        error.value = null
        try {
            await taskApi.updateTask(id, payload)
            // A task can have several instances, so reload all cards.
            await fetchTasks()
        } catch (err: unknown) {
            if (err instanceof Error) {
                error.value = err.message
            }
        }
    }

    async function deleteTask(id: number) {
        error.value = null
        try {
            await taskApi.deleteTask(id)
            tasks.value = tasks.value.filter(t => t.id !== id)
        } catch (err: unknown) {
            if (err instanceof Error) {
                error.value = err.message
            }
        }
    }

    return {
        tasks,
        loading,
        error,
        openTasks,
        completedTasks,
        fetchTasks,
        toggleTask,
        addTask,
        updateTask,
        deleteTask
    }
})
