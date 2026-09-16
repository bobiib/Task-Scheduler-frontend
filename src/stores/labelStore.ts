import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LabelColor } from '../types/task'
import { useTaskStore } from './taskStore'

export interface LabelItem {
    id: string
    name: string
    color: LabelColor
}

export const useLabelStore = defineStore('labels', () => {
    const taskStore = useTaskStore()

    const labels = ref<LabelItem[]>([
        { id: '1', name: 'Development', color: 'development' },
        { id: '2', name: 'Schule', color: 'schule' },
        { id: '3', name: 'IT', color: 'it' },
        { id: '4', name: 'Design', color: 'design' },
        { id: '5', name: 'Organisation', color: 'organisation' }
    ])

    function getTaskCount(labelName: string): number {
        return taskStore.tasks.filter(
            task => task.label.name.toLowerCase() === labelName.toLowerCase()
        ).length
    }

    function addLabel(name: string, color: LabelColor) {
        const newLabel: LabelItem = {
            id: Date.now().toString(),
            name: name.trim(),
            color
        }
        labels.value.push(newLabel)
    }

    function deleteLabel(id: string) {
        labels.value = labels.value.filter(label => label.id !== id)
    }

    return {
        labels,
        getTaskCount,
        addLabel,
        deleteLabel
    }
})
