import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '../types/task'

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref<Task[]>([
        {
            id: '1',
            title: 'Sprint-Planning abschliessen',
            dueDate: 'Heute',
            dueTime: '14:00',
            isDueToday: true,
            label: { id: 'l1', name: 'Development', color: 'development' },
            recurrence: 'Wöchentlich',
            reminder: '1 Std. vorher',
            assignee: { id: 'u1', name: 'Liam', initials: 'LB' },
            completed: false
        },
        {
            id: '2',
            title: 'Projektstatusbericht Sprint 1',
            dueDate: '14. Okt.',
            dueTime: '17:00',
            isDueToday: false,
            label: { id: 'l2', name: 'Schule', color: 'schule' },
            reminder: '3 Tage vorher',
            assignee: { id: 'u2', name: 'Liam + Team', initials: 'LB' },
            completed: false
        },
        {
            id: '3',
            title: 'Server-Backup prüfen',
            dueDate: 'Heute',
            dueTime: '18:30',
            isDueToday: true,
            label: { id: 'l3', name: 'IT', color: 'it' },
            recurrence: 'Täglich',
            reminder: '30 Min. vorher',
            assignee: { id: 'u3', name: 'Dmytro', initials: 'DY' },
            completed: false
        },
        {
            id: '4',
            title: 'Mockups finalisieren',
            dueDate: '02. Sept.',
            dueTime: '12:00',
            isDueToday: false,
            label: { id: 'l4', name: 'Design', color: 'design' },
            reminder: '1 Tag vorher',
            assignee: { id: 'u1', name: 'Liam', initials: 'LB' },
            completed: false
        },
        {
            id: '5',
            title: 'Team-Meeting vorbereiten',
            dueDate: 'Morgen',
            dueTime: '10:00',
            isDueToday: false,
            label: { id: 'l5', name: 'Organisation', color: 'organisation' },
            reminder: '2 Std. vorher',
            assignee: { id: 'u4', name: 'Boris', initials: 'BO' },
            completed: false
        },
        {
            id: '6',
            title: 'Zwischenpräsentation planen',
            dueDate: '20. Okt.',
            dueTime: '15:00',
            isDueToday: false,
            label: { id: 'l2', name: 'Schule', color: 'schule' },
            reminder: '1 Woche vorher',
            assignee: { id: 'u5', name: 'Projektteam', initials: 'PT' },
            completed: false
        }
    ])

    const openTasks = computed(() => tasks.value.filter(t => !t.completed))
    const completedTasks = computed(() => tasks.value.filter(t => t.completed))

    function toggleTask(id: string) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            task.completed = !task.completed
        }
    }

    return {
        tasks,
        openTasks,
        completedTasks,
        toggleTask
    }
})
