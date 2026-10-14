import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PersonItem {
    id: number
    name: string
    role: string
    initials: string
}

export interface TeamItem {
    id: number
    name: string
    members: string[]
    initials: string
}

export const useTeamStore = defineStore('team', () => {
    const persons = ref<PersonItem[]>([
        { id: 1, name: 'Liam', role: 'Backend Developer', initials: 'LB' },
        { id: 2, name: 'Dmytro', role: 'Frontend Developer', initials: 'DY' },
        { id: 3, name: 'Boris', role: 'Developer', initials: 'BO' },
        { id: 4, name: 'Fabio', role: 'Developer', initials: 'FA' }
    ])

    const teams = ref<TeamItem[]>([
        {
            id: 1,
            name: 'Projektteam',
            members: ['Liam', 'Dmytro', 'Boris', 'Fabio'],
            initials: 'PT'
        }
    ])

    function addPerson(name: string, role: string) {
        const trimmedName = name.trim()
        const trimmedRole = role.trim() || 'Developer'
        const parts = trimmedName.split(' ')
        const firstPart = parts[0] ?? ''
        const secondPart = parts[1] ?? ''
        const initials = parts.length > 1
            ? ((firstPart[0] ?? '') + (secondPart[0] ?? '')).toUpperCase()
            : trimmedName.slice(0, 2).toUpperCase()
        persons.value.push({
            id: Date.now(),
            name: trimmedName,
            role: trimmedRole,
            initials
        })
    }

    function deletePerson(id: number) {
        persons.value = persons.value.filter(p => p.id !== id)
    }

    function addTeam(name: string, selectedMembers: string[]) {
        const trimmedName = name.trim()
        const initials = trimmedName.slice(0, 2).toUpperCase()

        teams.value.push({
            id: Date.now(),
            name: trimmedName,
            members: selectedMembers,
            initials
        })
    }

    function deleteTeam(id: number) {
        teams.value = teams.value.filter(t => t.id !== id)
    }

    return {
        persons,
        teams,
        addPerson,
        deletePerson,
        addTeam,
        deleteTeam
    }
})
