import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LabelColor } from '../types/task'
import { labelApi, type ApiLabel } from '../api/labelApi'

export interface LabelItem {
    id: number
    name: string
    color: LabelColor
    taskCount: number
}

// The seed data stores hex colors, the frontend uses color keys.
const hexToColor: Record<string, LabelColor> = {
    '#4f46e5': 'development',
    '#9333ea': 'schule',
    '#0284c7': 'it',
    '#ef4444': 'design',
    '#d97706': 'organisation'
}
const colorKeys: LabelColor[] = ['development', 'schule', 'it', 'design', 'organisation']

function toLabelItem(label: ApiLabel): LabelItem {
    const color = colorKeys.find(key => key === label.color)
        ?? hexToColor[label.color.toLowerCase()]
        ?? 'development'
    return { id: label.id, name: label.name, color, taskCount: label.taskCount }
}

export const useLabelStore = defineStore('labels', () => {
    const labels = ref<LabelItem[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchLabels() {
        loading.value = true
        error.value = null
        try {
            const data = await labelApi.getLabels()
            labels.value = data.map(toLabelItem)
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Labels'
        } finally {
            loading.value = false
        }
    }

    async function addLabel(name: string, color: LabelColor) {
        error.value = null
        try {
            const created = await labelApi.createLabel(name.trim(), color)
            labels.value.push(toLabelItem(created))
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen des Labels'
        }
    }

    async function deleteLabel(id: number) {
        error.value = null
        try {
            await labelApi.deleteLabel(id)
            labels.value = labels.value.filter(label => label.id !== id)
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Labels'
        }
    }

    return {
        labels,
        loading,
        error,
        fetchLabels,
        addLabel,
        deleteLabel
    }
})
